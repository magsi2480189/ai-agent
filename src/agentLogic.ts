import { QAItem, BusinessSetup } from "./types";

export function generateAgentResponse(
  userMsg: string,
  businessSetup: BusinessSetup,
  qaList: QAItem[]
): { reply: string | null; status: "answered" | "ignored" } {
  const cleanText = userMsg.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  const words = cleanText.split(/\s+/);

  if (words.length === 0 || !cleanText) {
    return { reply: null, status: "ignored" };
  }

  const ignoreKeywords = [
    "dahi", "ammi", "mubarak", "meow", "hi how", "how are you",
    "salam wasiq", "hello wasiq", "walaikum", "baat", "bhai", "kese hen", "yar", "gup", "chay"
  ];

  const isPersonal = ignoreKeywords.some(keyword =>
    cleanText.includes(keyword) || words.includes(keyword)
  );

  let bestMatch: QAItem | null = null;
  let highestScore = 0;

  qaList.forEach((item) => {
    const qClean = item.question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const qWords = qClean.split(/\s+/);
    let overlap = 0;
    words.forEach(w => {
      if (w.length > 2 && qWords.includes(w)) overlap += 2;
      else if (qWords.includes(w)) overlap += 1;
    });
    if (overlap > highestScore) {
      highestScore = overlap;
      bestMatch = item;
    }
  });

  if (bestMatch && highestScore >= 2 && !isPersonal) {
    return { reply: (bestMatch as QAItem).answer, status: "answered" };
  }

  const bizDesc = businessSetup.business_description.toLowerCase();
  const matchesBizDesc = words.some(w => w.length > 3 && bizDesc.includes(w));

  if (matchesBizDesc && !isPersonal) {
    return {
      reply: `Thank you for your interest! Regarding this, our team is reviewing your query. Since it involves our core operations described in our setup, an agent or the owner (${businessSetup.owner_number || "our main number"}) will connect with you soon.`,
      status: "answered"
    };
  }

  return { reply: null, status: "ignored" };
}