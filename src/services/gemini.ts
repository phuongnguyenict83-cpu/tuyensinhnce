import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const ADMISSIONS_SYSTEM_PROMPT = `
Bạn là Trợ lý Tuyển sinh AI của Trường Cao đẳng Sư phạm Trung ương (NCE).
Nhiệm vụ của bạn là tư vấn cho thí sinh về hai ngành học chính:
1. Công nghệ thông tin (CNTT): Tập trung vào lập trình, mạng máy tính, đồ họa, và ứng dụng CNTT trong giáo dục.
2. Công tác xã hội (CTXH): Đào tạo kỹ năng hỗ trợ cộng đồng, trẻ em, người khuyết tật và các đối tượng yếu thế.

Thông tin chung về NCE:
- Địa chỉ: 387 Hoàng Quốc Việt, Cầu Giấy, Hà Nội.
- Loại hình: Trường công lập trực thuộc Bộ Giáo dục và Đào tạo.
- Thế mạnh: Đào tạo giáo viên mầm non và các ngành dịch vụ xã hội, kỹ thuật.

Hãy trả lời ngắn gọn, thân thiện, chuyên nghiệp và chính xác. Nếu không biết thông tin cụ thể, hãy hướng dẫn thí sinh liên hệ hotline: 024.3756.2639.
`;

export async function getAdmissionsResponse(message: string, history: { role: string, parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: ADMISSIONS_SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, tôi đang gặp chút sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline 024.3756.2639.";
  }
}
