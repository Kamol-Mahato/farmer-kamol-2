// লাইভ চ্যাটের ডিফল্ট স্বাগতম বার্তা — সার্ভার (chat/send) আর ক্লায়েন্ট (ChatWidget)
// দুই জায়গাতেই একই টেক্সট ব্যবহারের জন্য এক জায়গায় রাখা হলো।
export const CHAT_WELCOME_TEXT =
  "Farmer Kamol-এ আপনাকে স্বাগতম 🌿\n\nআমরা সিরাজগঞ্জের রায়গঞ্জ থেকে সরাসরি খাঁটি ও মানসম্মত দেশি পণ্য পৌঁছে দিচ্ছি আপনার দরজায়।\n\nআপনাকে কীভাবে সাহায্য করতে পারি? আপনার প্রশ্নটি নিচে লিখে দিন, আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যুক্ত হবেন।\n\n📞 দ্রুত উত্তরের জন্য কল বা হোয়াটসঅ্যাপ করুন: 01737939688\n\n🌐 আমাদের ফেসবুক পেজ ও ইউটিউব চ্যানেল ঘুরে আসতে পারেন:\n- [Facebook](https://www.facebook.com/farmerkamol)\n- [YouTube](https://www.youtube.com/@FarmerKamol)";

// ইংরেজি (/en) ভিজিটরদের জন্য একই বার্তা
export const CHAT_WELCOME_TEXT_EN =
  "Welcome to Farmer Kamol 🌿\n\nWe deliver pure, quality local (desi) products straight from Raiganj, Sirajganj to your doorstep.\n\nHow can we help you? Type your question below and our representative will join you shortly.\n\n📞 For a quick reply, call or WhatsApp: 01737939688\n\n🌐 You can also visit our Facebook page and YouTube channel:\n- [Facebook](https://www.facebook.com/farmerkamol)\n- [YouTube](https://www.youtube.com/@FarmerKamol)";

// 🤖 প্রথম মেসেজ পাঠানোর সাথে সাথে স্বয়ংক্রিয় বার্তা (WhatsApp লিংকসহ)
function buildWhatsAppUrl(whatsapp: string, question: string) {
  const short = question.length > 150 ? question.slice(0, 150) + "…" : question;
  const message = `আমি ওয়েবসাইট চ্যাটে জিজ্ঞেস করেছিলাম: ${short}`;
  // ( ) এনকোড না হলে মার্কডাউন লিংক ভেঙে যায়, তাই হাতে এনকোড করা হলো
  const encoded = encodeURIComponent(message)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return `https://wa.me/${whatsapp}?text=${encoded}`;
}

export function buildAutoReplyText(
  whatsapp: string,
  phoneDisplay: string,
  question: string,
  isEn: boolean,
) {
  const url = buildWhatsAppUrl(whatsapp, question);
  if (isEn) {
    return `✅ Thank you! Your message has been forwarded to our representative.\n\nFor a faster reply, message us directly on WhatsApp or call ${phoneDisplay}:\n- [Reply on WhatsApp](${url})`;
  }
  return `✅ ধন্যবাদ! আপনার বার্তা আমাদের প্রতিনিধির কাছে পাঠানো হয়েছে।\n\nদ্রুত উত্তর পেতে সরাসরি হোয়াটসঅ্যাপ করুন অথবা কল করুন ${phoneDisplay} নম্বরে:\n- [WhatsApp-এ উত্তর পান](${url})`;
}
