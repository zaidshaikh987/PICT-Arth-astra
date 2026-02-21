export interface PolicyFact {
    id: string;
    category: "fact" | "update" | "tip";
    text: {
        en: string;
        hi: string;
        mr: string;
    };
    context?: string[]; // e.g., ["loans", "dashboard"]
}

export const policyData: PolicyFact[] = [
    // FACTS
    {
        id: "f1",
        category: "fact",
        text: {
            en: "Did you know? A credit score of 750+ can save you up to ₹2 Lakhs on a ₹50L home loan.",
            hi: "क्या आप जानते हैं? 750+ का क्रेडिट स्कोर आपको ₹50L के होम लोन पर ₹2 लाख तक बचा सकता है।",
            mr: "तुम्हाला माहीत आहे का? 750+ क्रेडिट स्कोर तुम्हाला ₹50L च्या गृह कर्जावर ₹2 लाखांपर्यंत वाचवू शकतो."
        },
        context: ["dashboard", "loans", "eligibility"]
    },
    {
        id: "f2",
        category: "fact",
        text: {
            en: "Compounding Effect: Investing ₹5,000/month for 20 years at 12% returns can grow to ₹48 Lakhs.",
            hi: "कंपाउंडिंग प्रभाव: 20 वर्षों के लिए ₹5,000/माह का निवेश 12% रिटर्न पर ₹48 लाख तक बढ़ सकता है।",
            mr: "चक्रवाढ परिणाम: 20 वर्षांसाठी ₹5,000/महिना गुंतवणूक केल्यास 12% परताव्यावर ₹48 लाख होऊ शकतात."
        },
        context: ["optimizer", "multi-goal"]
    },

    // UPDATES (Policies)
    {
        id: "u1",
        category: "update",
        text: {
            en: "New RBI Rule: No penalty on prepaying floating rate home loans.",
            hi: "नया आरबीआई नियम: फ्लोटिंग रेट होम लोन को समय से पहले चुकाने पर कोई जुर्माना नहीं।",
            mr: "नवीन आरबीआय नियम: फ्लोटिंग रेट गृह कर्जाची वेळेपूर्वी परतफेड केल्यास कोणताही दंड नाही."
        },
        context: ["loans", "dashboard"]
    },
    {
        id: "u2",
        category: "update",
        text: {
            en: "Tax Benefit: Claim up to ₹1.5L deduction under Section 80C for ELSS investments.",
            hi: "कर लाभ: ईएलएसएस निवेश के लिए धारा 80सी के तहत ₹1.5 लाख तक की कटौती का दावा करें।",
            mr: "कर लाभ: ईएलएसएस गुंतवणुकीसाठी कलम 80C अंतर्गत ₹1.5 लाखांपर्यंत कपातीचा दावा करा."
        },
        context: ["optimizer", "documents"]
    },

    // TIPS
    {
        id: "t1",
        category: "tip",
        text: {
            en: "Tip: Keep your credit utilization below 30% to boost your score fast.",
            hi: "सुझाव: अपने स्कोर को तेजी से बढ़ाने के लिए क्रेडिट उपयोग को 30% से कम रखें।",
            mr: "टीप: तुमचा स्कोर वेगाने वाढवण्यासाठी क्रेडिट वापर 30% च्या खाली ठेवा."
        },
        context: ["eligibility", "rejection-recovery"]
    },
    {
        id: "t2",
        category: "tip",
        text: {
            en: "Smart Move: Review your credit report every 3 months for errors.",
            hi: "स्मार्ट कदम: त्रुटियों के लिए हर 3 महीने में अपनी क्रेडिट रिपोर्ट की समीक्षा करें।",
            mr: "स्मार्ट हालचाल: चुकांसाठी दर 3 महिन्यांनी तुमच्या क्रेडिट रिपोर्ट चे पुनरावलोकन करा."
        },
        context: ["recommendations", "documents"]
    }
];
