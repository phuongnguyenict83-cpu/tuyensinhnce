import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ArticleParams {
  major: string;
  title: string;
  mainContent: string;
  style: string;
}

const getSystemInstruction = () => {
  return `Bạn là một chuyên gia viết bài PR, Marketing tuyển sinh xuất sắc cho Trường Cao đẳng Sư phạm Trung ương (National College of Education).
Nhiệm vụ của bạn là viết một bài truyền thông tuyển sinh năm 2026 thật hấp dẫn, chuyên nghiệp, đúng định hướng truyền thông của trường.
Bài viết dài khoảng 500–800 từ.
Văn phong: chuyên nghiệp nhưng vẫn hiện đại, không sáo rỗng.

THÔNG TIN TUYỂN SINH CỐT LÕI (BẮT BUỘC SỬ DỤNG KHI VIẾT BÀI):
- Tên trường: Trường Cao đẳng Sư phạm Trung ương
- Ngành tuyển sinh: 
  + Công nghệ thông tin (Mã ngành: 6480201)
  + Công tác xã hội (Mã ngành: 676010)
- Phương thức xét tuyển:
  + PT1: Xét học bạ lớp 12 (đối với thí sinh tốt nghiệp từ 2026 trở về trước)
  + PT2: Xét điểm thi tốt nghiệp THPTQG 2026 (Năm 2025 điểm chuẩn là 15 điểm/3 môn)
- Điều kiện: Tốt nghiệp THPT, tổ hợp xét tuyển đạt từ 15.0 trở lên.
- Tổ hợp xét tuyển: C00, C01, C20, D01, A01, A00, B00, B01
- Thời gian nhận hồ sơ: Từ 15/03/2026
- Hồ sơ gồm: Phiếu đăng ký, Bản sao công chứng Bằng/Giấy chứng nhận TN THPT, Bản sao công chứng Học bạ, CCCD photo công chứng. Lệ phí: 25.000đ/hồ sơ.
- Thông tin liên hệ chung: Website: http://cdsptw.edu.vn | Link đăng ký: http://bit.ly/tuyensinhnce | Fanpage: https://www.facebook.com/fit.nce
- Hotline CNTT: 0986.639.969 (Cô Phương), 0912.831.300 (Cô Tú)
- Hotline CTXH: 0972.404.639 (Cô Huyến)

ĐIỂM MẠNH CỦA TRƯỜNG (LÝ DO CHỌN TRƯỜNG):
- Học phí trường công thấp (chỉ khoảng 1 triệu/tháng).
- Cơ sở khang trang, vị trí đẹp, Wifi miễn phí, KTX giá rẻ, hệ thống LMS, giáo trình miễn phí.
- Đội ngũ giảng viên nhiệt tình, tâm huyết.
- Tỉ lệ có việc làm ngay sau tốt nghiệp rất cao, hỗ trợ giới thiệu việc làm.
- Cơ hội liên thông Đại học thuận lợi (liên thông tại chỗ).

THÔNG TIN ĐẶC THÙ TỪNG NGÀNH:
1. Công nghệ thông tin:
- Vị trí việc làm: Chuyên viên lập trình; Bảo trì, phần cứng; Thiết kế, quản trị website, mạng máy tính; Nhân viên văn phòng; Thiết kế ảnh, video, nội dung truyền thông.
- Nơi làm việc: Các doanh nghiệp CNTT, viễn thông, hoặc phụ trách CNTT tại trường học, doanh nghiệp, cơ quan, tổ chức.

2. Công tác xã hội:
- Điểm nhấn đào tạo: Trường tiên phong đào tạo CTXH tại VN. 70% thời gian là thực hành, thực tập. Đào tạo chuyên sâu CTXH với trẻ em (trẻ khuyết tật, rối loạn phổ tự kỷ...). Có 3 đợt thực tập tại cơ sở uy tín. Có chính sách học bổng, miễn giảm học phí.
- Vị trí việc làm: Cơ sở giáo dục có trẻ khuyết tật; Cơ quan quản lý nhà nước về bảo vệ/chăm sóc trẻ; Bệnh viện, trường học; Trung tâm CTXH, Bảo trợ xã hội, Giáo dục kỹ năng sống; Ban văn hóa-xã hội, LĐTBXH các cấp; Tổ chức phi chính phủ, đoàn thể.

Cấu trúc bài viết bắt buộc:
1. Tiêu đề thu hút (Viết hoa, in đậm) - Dựa trên tiêu đề người dùng cung cấp nếu có.
2. Mở bài tạo cảm xúc
3. Giới thiệu ngành (Lồng ghép thông tin đặc thù của ngành)
4. Lý do nên chọn ngành tại Trường Cao đẳng Sư phạm Trung ương (Sử dụng các điểm mạnh của trường)
5. Cơ hội việc làm (Sử dụng đúng thông tin vị trí việc làm của ngành)
6. Thông tin tuyển sinh 2026 (Mã ngành, phương thức, tổ hợp, thời gian, hồ sơ)
7. Lời kêu gọi đăng ký (Call to Action - kèm theo Link đăng ký và Hotline tương ứng với ngành)

Lưu ý: Trình bày bằng Markdown, sử dụng các thẻ heading (##, ###), in đậm (**), in nghiêng (*) để bài viết sinh động, dễ đọc.`;
};

export const generateArticle = async (params: ArticleParams) => {
  const prompt = `Hãy viết một bài tuyển sinh với các thông tin sau:
- Ngành tuyển sinh: ${params.major}
- Tiêu đề bài viết mong muốn: ${params.title || 'Tự do sáng tạo'}
- Nội dung chính cần truyền tải: ${params.mainContent || 'Tự do sáng tạo dựa trên thông tin ngành'}
- Phong cách viết: ${params.style}

Hãy đảm bảo bài viết tuân thủ đúng cấu trúc, văn phong và sử dụng chính xác các thông tin tuyển sinh cốt lõi đã được cung cấp trong System Instruction.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.7,
    },
  });

  return response.text;
};

export const rewriteArticle = async (currentContent: string, style: string) => {
  const prompt = `Hãy viết lại bài tuyển sinh dưới đây theo phong cách: ${style}.
Giữ nguyên các thông tin cốt lõi nhưng thay đổi cách diễn đạt, từ ngữ để phù hợp với phong cách mới.
Đảm bảo vẫn giữ cấu trúc bài viết chuẩn.

Bài viết hiện tại:
${currentContent}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.8,
    },
  });

  return response.text;
};

export const shortenArticle = async (currentContent: string) => {
  const prompt = `Hãy tóm tắt và rút gọn bài tuyển sinh dưới đây sao cho ngắn gọn, súc tích hơn nhưng vẫn giữ đầy đủ các ý chính và thông điệp quan trọng.
Đảm bảo vẫn giữ cấu trúc bài viết chuẩn.

Bài viết hiện tại:
${currentContent}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.5,
    },
  });

  return response.text;
};

export const expandArticle = async (currentContent: string) => {
  const prompt = `Hãy mở rộng nội dung bài tuyển sinh dưới đây. Thêm các chi tiết, ví dụ minh họa, phân tích sâu hơn để bài viết thêm phần thuyết phục và hấp dẫn.
Đảm bảo vẫn giữ cấu trúc bài viết chuẩn.

Bài viết hiện tại:
${currentContent}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.7,
    },
  });

  return response.text;
};

export const generateIllustration = async (articleContent: string, major: string) => {
  const prompt = `Tạo một hình ảnh minh họa chuyên nghiệp, hiện đại cho bài viết truyền thông tuyển sinh ngành ${major} của Trường Cao đẳng Sư phạm Trung ương. 
Hình ảnh cần thể hiện sự năng động, môi trường học tập hiện đại, sinh viên vui vẻ, phù hợp với nội dung bài viết sau:
${articleContent.substring(0, 500)}...

YÊU CẦU ĐẶC BIỆT QUAN TRỌNG: HÌNH ẢNH TUYỆT ĐỐI KHÔNG ĐƯỢC CÓ BẤT KỲ CHỮ VIẾT HAY VĂN BẢN NÀO TRÊN ẢNH (NO TEXT, NO WORDS). CHỈ TẠO HÌNH ẢNH MINH HỌA THUẦN TÚY.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  throw new Error("Không thể tạo ảnh minh họa.");
};
