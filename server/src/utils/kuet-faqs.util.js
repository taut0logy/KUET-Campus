/**
 * KUET Campus FAQ utility
 * Contains frequently asked questions, answers, and variations for paraphrasing
 */

// Array of FAQ objects with question patterns and answer variations
const kuetFaqs = [
    {
        patterns: [
            'what is kuet',
            'tell me about kuet',
            'kuet information',
            'kuet overview',
            'history of kuet'
        ],
        answer: 'Khulna University of Engineering & Technology (KUET) is one of the leading public engineering universities in Bangladesh, established in 1967 (initially as Khulna Engineering College). It offers undergraduate and graduate programs in various engineering disciplines and is renowned for its academic excellence.',
        variations: [
            'Founded in 1967 as Khulna Engineering College, KUET (Khulna University of Engineering & Technology) has grown to become one of Bangladesh\'s premier public engineering institutions. The university is well-known for its strong academic programs at both undergraduate and graduate levels across various engineering fields.',
            'KUET, or Khulna University of Engineering & Technology, stands as a top-tier public engineering university in Bangladesh. Originally established as Khulna Engineering College in 1967, it has built a reputation for academic excellence, offering a wide range of undergraduate and graduate engineering programs.',
            'Khulna University of Engineering & Technology, commonly known as KUET, is a distinguished public engineering institution in Bangladesh that began its journey in 1967 as Khulna Engineering College. Today, it is recognized for its outstanding academic offerings in numerous engineering disciplines at both undergraduate and graduate levels.'
        ]
    },
    {
        patterns: [
            'where is kuet',
            'kuet location',
            'kuet address',
            'how to reach kuet',
            'kuet campus location',
            'directions to kuet'
        ],
        answer: 'KUET is located in Khulna, Bangladesh. The address is: Khulna University of Engineering & Technology, Fulbarigate, Khulna-9203, Bangladesh. It\'s approximately 12 kilometers from Khulna city center.',
        variations: [
            'You can find KUET in Khulna, Bangladesh, specifically at Fulbarigate, Khulna-9203. The campus is situated about 12 kilometers away from downtown Khulna.',
            'The university campus is located at Fulbarigate in Khulna, Bangladesh, with the full address being Khulna University of Engineering & Technology, Khulna-9203. If you\'re coming from Khulna city center, you\'ll need to travel approximately 12 kilometers to reach the campus.',
            'KUET\'s address is Fulbarigate, Khulna-9203, Bangladesh. The campus is positioned roughly 12 kilometers from the heart of Khulna city, making it accessible yet providing a focused academic environment.'
        ]
    },
    {
        patterns: [
            'departments at kuet',
            'depts at kuet',
            'academic departments',
            'what departments',
            'kuet departments',
            'what can i study at kuet',
            'how many departments',   
            'how many depts',   
            'number of departments',  
            'department count',       
            'departments in kuet',
            'departments are in kuet',
            'department list'
        ],
        answer: 'KUET has 18 academic departments including: Computer Science & Engineering (CSE), Electrical & Electronic Engineering (EEE), Mechanical Engineering (ME), Civil Engineering (CE), Architecture, Electronics and Communication Engineering (ECE), Biomedical Engineering, and more.',
        variations: [
            'The university maintains 18 different academic departments, with notable ones including CSE (Computer Science & Engineering), EEE (Electrical & Electronic Engineering), ME (Mechanical Engineering), CE (Civil Engineering), Architecture, ECE (Electronics and Communication Engineering), and Biomedical Engineering, among others.',
            'KUET offers education through 18 academic departments. Students can pursue degrees in fields such as Computer Science & Engineering, Electrical & Electronic Engineering, Mechanical Engineering, Civil Engineering, Architecture, Electronics and Communication Engineering, and Biomedical Engineering, plus several other disciplines.',
            'There are 18 academic departments at KUET covering diverse engineering disciplines. These include Computer Science & Engineering, Electrical & Electronic Engineering, Mechanical Engineering, Civil Engineering, Architecture, Electronics and Communication Engineering, and Biomedical Engineering, as well as other specialized fields.'
        ]
    },
    {
        patterns: [
            'admission',
            'how to get admission',
            'admission process',
            'enroll at kuet',
            'apply to kuet',
            'admission requirements',
            'admission criteria',
            'admission schedule',
        ],
        answer: 'Admission to KUET undergraduate programs is highly competitive and based on the results of an admission test. Candidates must have completed HSC/A-Level or equivalent with minimum GPA requirements in Physics, Chemistry, and Mathematics. For postgraduate programs, requirements vary by department.',
        variations: [
            'Getting into KUET undergraduate programs requires passing a competitive admission test. Applicants need to have completed HSC/A-Level or an equivalent qualification with specified minimum GPA scores in Physics, Chemistry, and Mathematics. The requirements for postgraduate admission differ across departments.',
            'KUET has a selective admission process centered around performance in an entrance examination. To be eligible, you must have finished your HSC/A-Level or equivalent education with required minimum grades in Physics, Chemistry, and Mathematics. If you are interested in postgraduate studies, each department sets its own specific requirements.',
            'The undergraduate admission process at KUET is competitive, primarily determined by your performance on their admission test. Eligible candidates should have completed HSC/A-Level or equivalent education with specified minimum performance in Physics, Chemistry, and Mathematics courses. For those seeking postgraduate admission, requirements are department-specific.'
        ]
    },
    {
        patterns: [
            'academic calendar',
            'semester dates',
            'academic year',
            'semester schedule',
            'when do classes start'
        ],
        answer: 'The academic year at KUET is divided into two semesters: January-June and July-December. Each semester consists of approximately 14 weeks of classes followed by exam periods. For specific dates, please check the official KUET website or academic notices.',
        variations: [
            'KUET operates on a two-semester academic calendar: the first running from January to June and the second from July to December. Each semester typically includes about 14 weeks of instruction followed by examination periods. You should refer to the university official website or academic bulletins for precise dates.',
            'The university structures its academic year into two main semesters: January-June and July-December. Students attend approximately 14 weeks of classes in each semester before taking their exams. For the most current scheduling information, you should consult the official KUET website or academic announcements.',
            'At KUET, the academic calendar features two semesters per year: January through June and July through December. A typical semester includes around 14 weeks of teaching followed by examination weeks. To get exact dates for the current academic year, check the university official communications or website.'
        ]
    },
    {
        patterns: [
            'hostel',
            'accommodation',
            'dormitory',
            'student housing',
            'where to stay',
            'residential halls'
        ],
        answer: 'KUET has several residential halls for students including Lalan Shah Hall, Fazlul Haque Hall, Khan Jahan Ali Hall, Dr. M.A. Rashid Hall for male students, and Amar Ekushey Hall for female students. Accommodation is allocated based on availability and merit.',
        variations: [
            'Student accommodation at KUET is provided through various residential halls. Male students may be placed in Lalan Shah Hall, Fazlul Haque Hall, Khan Jahan Ali Hall, or Dr. M.A. Rashid Hall, while female students stay at Amar Ekushey Hall. Housing assignments depend on both merit and availability.',
            'KUET offers on-campus housing through its residential hall system. For male students, options include Lalan Shah Hall, Fazlul Haque Hall, Khan Jahan Ali Hall, and Dr. M.A. Rashid Hall. Female students are accommodated in Amar Ekushey Hall. The university distributes housing based on merit and current availability.',
            'The university maintains several dormitories for student accommodation. These include four halls for male students (Lalan Shah Hall, Fazlul Haque Hall, Khan Jahan Ali Hall, and Dr. M.A. Rashid Hall) and Amar Ekushey Hall for female students. Your placement in these facilities depends on your academic standing and whether space is available.'
        ]
    },
    {
        patterns: [
            'facilities',
            'campus facilities',
            'what facilities',
            'amenities',
            'student facilities'
        ],
        answer: 'KUET campus facilities include: Central Library, Medical Center, Sports Complex, Cafeterias, Student Welfare Center, Computing Facilities, Auditorium, Mosque, and various laboratories. Students have access to Wi-Fi across much of the campus.',
        variations: [
            'KUET provides its students with numerous facilities including a well-stocked Central Library, an on-campus Medical Center, and a comprehensive Sports Complex. You will also find Cafeterias, a Student Welfare Center, Computing Labs, an Auditorium, a Mosque, and specialized laboratories. Wi-Fi connectivity is available throughout most areas of the campus.',
            'The campus at KUET features a range of facilities to support student life and learning. These include the Central Library, a dedicated Medical Center, athletic facilities at the Sports Complex, dining options at various Cafeterias, and support services at the Student Welfare Center. The university also maintains Computing Facilities, an Auditorium, a Mosque, and numerous laboratories, with Wi-Fi access provided across most of the campus.',
            'Students at KUET benefit from diverse campus amenities including the Central Library for research and study, a Medical Center for healthcare needs, and a Sports Complex for physical activities. Additional facilities include Cafeterias, a Student Welfare Center, Computing Facilities, an Auditorium for events, a Mosque for religious observances, and specialized laboratories for practical learning. Wi-Fi service is accessible in most campus areas.'
        ]
    },
    {
        patterns: [
            'extracurricular activities',
            'extra curricular activities',
            'extracurricular',
            'extra curricular',
            'co-curricular',
            'student groups',
            'societies',
            'student activities',
            'student can do',
            'activities that a student',
            'activities in kuet',
            'campus life'
        ],
        answer: 'KUET has numerous student clubs and organizations covering technical, cultural, and social interests. These include SGIPC which is dedicated in Competitive Programming, BIT2bye which is dedicated in software development, HACK which is dedicated in hardware, Photography Club, Sports Club, Cultural Club, and many others.',
        variations: [
            'Students at KUET can participate in a wide variety of extracurricular groups catering to different interests. Technical organizations like SGIPC (focused on Competitive Programming), BIT2bye (for software development enthusiasts), and HACK (for hardware exploration) are popular choices. The university also hosts a Photography Club, Sports Club, Cultural Club, and numerous other student organizations.',
            'KUET offers a vibrant campus life with many student-led organizations. For those interested in technology, groups like SGIPC (Competitive Programming), BIT2bye (software development), and HACK (hardware) provide valuable experiences beyond the classroom. Other options include the Photography Club for creative expression, Sports Club for athletic activities, Cultural Club for arts and performances, plus many more student societies.',
            'The extracurricular landscape at KUET features diverse student clubs and organizations. Technical groups include SGIPC for those passionate about Competitive Programming, BIT2bye for students focused on software development, and HACK for hardware enthusiasts. Additionally, students can join the Photography Club to pursue creative interests, the Sports Club for physical activities, the Cultural Club for artistic expression, or numerous other organizations matching their interests.'
        ]
    },
    {
        patterns: [
            'research',
            'research facilities',
            'research areas',
            'research centers',
            'research opportunities'
            
        ],
        answer: 'KUET emphasizes research across engineering disciplines. The university has specialized research labs and centers including the Institute of Information and Communication Technology (IICT). Faculty and students conduct research in areas including renewable energy, AI, structural engineering, power systems, and environmental engineering.',
        variations: [
            'Research is a priority at KUET, with dedicated facilities spanning various engineering fields. The Institute of Information and Communication Technology (IICT) serves as a prominent research center, and both faculty and students actively investigate topics like renewable energy sources, artificial intelligence applications, structural engineering innovations, power system advancements, and environmental engineering solutions.',
            'KUET maintains a strong focus on research activities throughout its engineering departments. The university houses specialized research facilities, notably the Institute of Information and Communication Technology (IICT). Active research areas include renewable energy technologies, artificial intelligence development, structural engineering advancements, power systems optimization, and environmental engineering projects.',
            'The research ecosystem at KUET spans numerous engineering disciplines, supported by specialized laboratories and research centers such as the Institute of Information and Communication Technology (IICT). Faculty members and students collaborate on research in diverse fields including renewable energy systems, artificial intelligence applications, structural engineering challenges, power systems design, and environmental engineering solutions.'
        ]
    },
    {
        patterns: [
            'tuition fees',
            'cost of studying',
            'semester fees',
            'expenses',
            'financial information',
            'how much does it cost'
        ],
        answer: 'As a public university, KUET has relatively affordable tuition fees compared to private institutions. Undergraduate programs cost approximately 25,000-40,000 BDT per semester depending on the department. Additional costs include residential hall fees, books, and personal expenses.',
        variations: [
            'KUET, being a public university, offers relatively affordable education compared to private alternatives. Tuition for undergraduate programs ranges from about 25,000 to 40,000 BDT per semester, varying by department. Students should also budget for additional expenses such as residential hall fees, textbooks, and personal needs.',
            'The cost of education at KUET is relatively modest compared to private universities in Bangladesh. Undergraduate students can expect to pay between 25,000 and 40,000 BDT per semester for tuition, with the exact amount depending on their chosen department. Beyond tuition, students need to consider costs for accommodation in residential halls, academic materials, and day-to-day expenses.',
            'Studying at KUET is comparatively affordable since it is a public institution. Undergraduate tuition fees typically range from 25,000 to 40,000 BDT each semester, with specific amounts varying across different departments. Remember that your total expenses will also include costs for residential accommodation, books and study materials, and personal living expenses.'
        ]
    }
];

/**
 * Find a matching FAQ answer for a given query and return a paraphrased version
 * @param {string} query - The user's question
 * @return {string|null} - The answer if found, null otherwise
 */
function findFaqAnswer(query) {
    if (!query) return null;
    
    const normalizedQuery = query.toLowerCase().trim();
    console.log('📝 Searching for FAQ match for query:', normalizedQuery);
    
    // Track which FAQ entry matched
    let matchedFaq = null;
    
    // First try exact pattern matching
    for (const faq of kuetFaqs) {
        for (const pattern of faq.patterns) {
            if (normalizedQuery.includes(pattern)) {
                console.log(`✅ Pattern match found: "${pattern}" in query: "${normalizedQuery}"`);
                matchedFaq = faq;
                break;
            }
        }
        if (matchedFaq) break;
    }
    
    // If no exact match, try keyword matching
    if (!matchedFaq) {
        const queryWords = normalizedQuery.split(/\s+/);
        
        // Map topics to their important keywords and corresponding FAQ index
        const topicKeywords = {
            'extracurricular': {
                keywords: ['club', 'extracurricular', 'extra', 'curricular', 'activities', 'society', 'societies'],
                patterns: ['extracurricular activities', 'extra curricular activities']
            },
            'department': {
                keywords: ['department', 'academic', 'study', 'major', 'course'],
                patterns: ['departments at kuet', 'academic departments']
            },
            'location': {
                keywords: ['where', 'location', 'address', 'place', 'situated', 'located'],
                patterns: ['where is kuet', 'kuet location']
            },
            'admission': {
                keywords: ['admission', 'apply', 'enroll', 'join', 'student', 'become'],
                patterns: ['admission', 'how to get admission']
            },
            'hostel': {
                keywords: ['hostel', 'accommodation', 'dormitory', 'dorm', 'stay', 'live', 'residence', 'hall'],
                patterns: ['hostel', 'accommodation']
            },
            'facilities': {
                keywords: ['facilities', 'amenities', 'services', 'infrastructure'],
                patterns: ['facilities', 'campus facilities']
            }
        };
        
        // Count matches for each topic based on keywords
        const topicMatches = {};
        for (const [topic, data] of Object.entries(topicKeywords)) {
            topicMatches[topic] = 0;
            for (const keyword of data.keywords) {
                if (queryWords.some(word => word.includes(keyword) || keyword.includes(word))) {
                    topicMatches[topic]++;
                }
            }
        }
        
        // Find the topic with the most keyword matches
        let bestTopic = null;
        let bestScore = 1; // Require at least 2 keyword matches
        
        for (const [topic, score] of Object.entries(topicMatches)) {
            if (score > bestScore) {
                bestScore = score;
                bestTopic = topic;
            }
        }
        
        // If we found a good topic match, look for the corresponding FAQ
        if (bestTopic) {
            const patterns = topicKeywords[bestTopic].patterns;
            for (const faq of kuetFaqs) {
                if (patterns.some(p => faq.patterns.includes(p))) {
                    console.log(`✅ Keyword match found for topic "${bestTopic}" with score ${bestScore}`);
                    matchedFaq = faq;
                    break;
                }
            }
        }
    }
    
    // Return null if no match found
    if (!matchedFaq) return null;
    
    // Select a random variation or the default answer
    if (matchedFaq.variations && matchedFaq.variations.length > 0) {
        // Get a variation that's different from the last one used for this FAQ if possible
        const lastIndex = matchedFaq._lastUsedIndex;
        let newIndex;
        
        if (matchedFaq.variations.length === 1) {
            newIndex = 0;
        } else {
            // Try to avoid using the same variation twice in a row
            do {
                newIndex = Math.floor(Math.random() * matchedFaq.variations.length);
            } while (newIndex === lastIndex && matchedFaq.variations.length > 1);
        }
        
        // Remember this variation for next time
        matchedFaq._lastUsedIndex = newIndex;
        
        return matchedFaq.variations[newIndex];
    }
    
    // Fall back to the standard answer if no variations
    return matchedFaq.answer;
}

module.exports = {
    findFaqAnswer,
    kuetFaqs // Export for potential use elsewhere
};