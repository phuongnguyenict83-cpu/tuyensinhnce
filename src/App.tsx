import React, { useState } from 'react';
import {
  PenTool,
  RefreshCw,
  Minimize2,
  Maximize2,
  Download,
  Copy,
  Check,
  Loader2,
  GraduationCap,
  Sparkles,
  BookOpen,
  Target,
  Briefcase,
  Building,
  Calendar,
  Megaphone,
  Type,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import Markdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import { generateArticle, rewriteArticle, shortenArticle, expandArticle, generateIllustration, ArticleParams } from './services/geminiService';

const MAJORS = [
  { id: 'cntt', name: 'Công nghệ thông tin' },
  { id: 'ctxh', name: 'Công tác xã hội' },
  { id: 'both', name: 'Cả 2 ngành' },
];

const STYLES = [
  { id: 'professional', name: 'Chuyên nghiệp – học thuật' },
  { id: 'youthful', name: 'Trẻ trung – truyền cảm hứng' },
  { id: 'marketing', name: 'Marketing – thu hút mạnh' },
  { id: 'formal', name: 'Trang trọng – chính thống' },
  { id: 'creative', name: 'Sáng tạo – khác biệt' },
];

export default function App() {
  const [formData, setFormData] = useState<ArticleParams>({
    major: MAJORS[0].name,
    title: '',
    mainContent: '',
    style: STYLES[0].name,
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setActiveAction('generate');
    setGeneratedImage(null);
    try {
      const content = await generateArticle(formData);
      setGeneratedContent(content || '');
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Đã có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleRewrite = async () => {
    if (!generatedContent) return;
    setIsLoading(true);
    setActiveAction('rewrite');
    try {
      const content = await rewriteArticle(generatedContent, formData.style);
      setGeneratedContent(content || '');
    } catch (error) {
      console.error('Error rewriting article:', error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleShorten = async () => {
    if (!generatedContent) return;
    setIsLoading(true);
    setActiveAction('shorten');
    try {
      const content = await shortenArticle(generatedContent);
      setGeneratedContent(content || '');
    } catch (error) {
      console.error('Error shortening article:', error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleExpand = async () => {
    if (!generatedContent) return;
    setIsLoading(true);
    setActiveAction('expand');
    try {
      const content = await expandArticle(generatedContent);
      setGeneratedContent(content || '');
    } catch (error) {
      console.error('Error expanding article:', error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    setIsLoading(true);
    setActiveAction('image');
    try {
      const imageUrl = await generateIllustration(generatedContent, formData.major);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Đã có lỗi xảy ra khi tạo ảnh minh họa.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleDownloadWord = async () => {
    if (!generatedContent) return;
    
    // Simple markdown to docx conversion (paragraphs and basic formatting)
    const lines = generatedContent.split('\n');
    const docChildren: any[] = [];

    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        docChildren.push(new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: {
                width: 600,
                height: 337, // 16:9 ratio
              },
            }),
          ],
        }));
        docChildren.push(new Paragraph({ text: '' })); // Empty line after image
      } catch (e) {
        console.error("Failed to add image to word document", e);
      }
    }

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        docChildren.push(new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
        }));
      } else if (line.startsWith('## ')) {
        docChildren.push(new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
        }));
      } else if (line.startsWith('### ')) {
        docChildren.push(new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
        }));
      } else if (line.trim() !== '') {
        // Handle bold text roughly
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const textRuns = parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true });
          }
          return new TextRun({ text: part });
        });
        
        docChildren.push(new Paragraph({
          children: textRuns,
        }));
      } else {
        docChildren.push(new Paragraph({ text: '' })); // Empty line
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Bai_Viet_Tuyen_Sinh_${formData.major.replace(/ /g, '_')}.docx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#ff6a00] to-[#ff8c42] text-white py-8 px-4 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap size={36} className="text-white/90" />
            <h2 className="text-sm md:text-base font-medium tracking-wider uppercase opacity-90">
              Trường Cao đẳng Sư phạm Trung ương
            </h2>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase drop-shadow-sm">
            App Viết Bài Tuyển Sinh 2026
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl mx-auto text-sm md:text-base">
            Công cụ hỗ trợ tạo nội dung truyền thông chuyên nghiệp, nhanh chóng và chuẩn xác.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 border-b pb-3">
              <Sparkles className="text-[#ff6a00]" size={20} />
              Thông tin cấu hình
            </h3>

            <div className="space-y-5">
              {/* Major Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <BookOpen size={16} className="text-slate-400" />
                  Ngành tuyển sinh
                </label>
                <select
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ff6a00] focus:ring-[#ff6a00] focus:bg-white transition-colors outline-none border"
                >
                  {MAJORS.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Type size={16} className="text-slate-400" />
                  Tiêu đề bài viết (Tùy chọn)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Cơ hội việc làm rộng mở với ngành CNTT..."
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ff6a00] focus:ring-[#ff6a00] focus:bg-white transition-colors outline-none border"
                />
              </div>

              {/* Main Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText size={16} className="text-slate-400" />
                  Nội dung chính cần truyền tải
                </label>
                <textarea
                  name="mainContent"
                  value={formData.mainContent}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Nhập các ý chính, thông điệp bạn muốn nhấn mạnh trong bài viết..."
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ff6a00] focus:ring-[#ff6a00] focus:bg-white transition-colors outline-none border resize-none"
                />
              </div>

              {/* Writing Style */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Type size={16} className="text-slate-400" />
                  Phong cách viết
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <label
                      key={style.id}
                      className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                        formData.style === style.name
                          ? 'border-[#ff6a00] bg-orange-50/50 text-[#ff6a00]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="style"
                        value={style.name}
                        checked={formData.style === style.name}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{style.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-8 w-full bg-gradient-to-r from-[#ff6a00] to-[#ff8c42] hover:from-[#e65f00] hover:to-[#e67e3b] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && activeAction === 'generate' ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang tạo bài viết...
                </>
              ) : (
                <>
                  <PenTool size={20} />
                  Tạo bài viết
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
            
            {/* Result Header & Actions */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#ff6a00]" />
                Kết quả bài viết
              </h3>
              
              {generatedContent && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRewrite}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#ff6a00] transition-colors disabled:opacity-50"
                    title="Viết lại"
                  >
                    {isLoading && activeAction === 'rewrite' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    <span className="hidden sm:inline">Viết lại</span>
                  </button>
                  <button
                    onClick={handleShorten}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#ff6a00] transition-colors disabled:opacity-50"
                    title="Rút gọn"
                  >
                    {isLoading && activeAction === 'shorten' ? <Loader2 size={14} className="animate-spin" /> : <Minimize2 size={14} />}
                    <span className="hidden sm:inline">Rút gọn</span>
                  </button>
                  <button
                    onClick={handleExpand}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#ff6a00] transition-colors disabled:opacity-50"
                    title="Mở rộng"
                  >
                    {isLoading && activeAction === 'expand' ? <Loader2 size={14} className="animate-spin" /> : <Maximize2 size={14} />}
                    <span className="hidden sm:inline">Mở rộng</span>
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#ff6a00] transition-colors disabled:opacity-50"
                    title="Tạo ảnh"
                  >
                    {isLoading && activeAction === 'image' ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    <span className="hidden sm:inline">Tạo ảnh</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#ff6a00] transition-colors"
                    title="Sao chép"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#ff6a00] border border-[#ff6a00] rounded-lg hover:bg-[#e65f00] transition-colors"
                    title="Tải Word"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Tải Word</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-grow p-6 overflow-y-auto min-h-[500px] bg-white">
              {isLoading && activeAction === 'generate' ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md bg-[#ff6a00]/20 animate-pulse"></div>
                    <Loader2 size={40} className="animate-spin text-[#ff6a00] relative z-10" />
                  </div>
                  <p className="text-sm font-medium animate-pulse">Đang sáng tạo nội dung...</p>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-slate prose-orange max-w-none">
                  {generatedImage && (
                    <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={generatedImage} alt="Ảnh minh họa bài viết" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="markdown-body">
                    <Markdown>{generatedContent}</Markdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
                    <PenTool size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">Nhập thông tin và nhấn "Tạo bài viết" để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 font-medium">Nguyễn Phương</p>
          <p className="text-slate-500 text-sm mt-1">Trường Cao đẳng Sư phạm Trung ương</p>
        </div>
      </footer>
    </div>
  );
}
