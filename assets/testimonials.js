const testimonialData = [
    {
        quote: "Jared consistently demonstrated a strong customer-first mindset, always ensuring that decisions and solutions aligned with real user needs. What sets him apart is his ability to not just execute, but to think creatively-he brings fresh, thoughtful ideas to the table that elevate the overall quality of work.",
        name: "Nabarun Paul",
        title: "Software Development Manager",
        company: "Autodesk",
        image: "assets/ref-1.png"
    },
    {
        quote: "Jared is an excellent mentor. The insights and knowledge I gained from him are invaluable, and his guidance significantly enhanced my professional growth as an experience designer.",
        name: "Sami Lee Go-Woolhiser",
        title: "Sr. Experience Designer",
        company: "Autodesk",
        image: "assets/ref-2.png"
    },
    {
        quote: "Jared brings a strong work ethic, creative energy and a wealth of design experience to every endeavor I've seen him undertake at Autodesk. Jared's concepts, designs and artifacts are always rooted in the fundamentals of user-centered design. He's a great champion of user empathy with development teams.",
        name: "Andrew Faix",
        title: "Principal Experience Designer",
        company: "Autodesk",
        image: "assets/ref-3.png"
    },
    {
        quote: "As a Principal Designer, Jared doesn't shy away from wicked problems--he faces them head-on and shows real courage in raising risks early, helping leadership anticipate and address potential UX issues before they reach users. On top of that, he's just a great teammate: calm, collaborative, and always focused on solving the right problem.",
        name: "Elliott Mackie",
        title: "Sr. Manager, Experience Design",
        company: "Autodesk",
        image: "assets/ref-4.png"
    },
    {
        quote: "I had the pleasure of working closely with Jared during our time together on the Fusion drawing team, where Jared led UX design. Jared brought a deep user empathy, and a strong collaborative spirit to every project we tackled.",
        name: "Clint Brown",
        title: "Sr. Product Manager",
        company: "Autodesk",
        image: "assets/ref-5.png"
    },
    {
        quote: "Jared has a unique ability to translate complex user needs into intuitive, elegant interfaces. Whether conducting user research, wireframing, or collaborating with developers, he brings a level of professionalism and creativity that elevates the entire team. Beyond his design skills, Jared is an excellent communicator and a great team player. He welcomes feedback, supports others, and always pushes for the best user experience possible.",
        name: "Anirudha Kulkarni",
        title: "Sr. Project Owner",
        company: "Autodesk",
        image: "assets/ref-6.png"
    }
];

function initTestimonials() {
    const track = document.getElementById('testimonial-track');
    if (!track) return;

    // Create the HTML for one full set of cards
    const cardHtml = testimonialData.map(item => `
        <div class="inline-block w-[400px] px-4 whitespace-normal">
            <div class="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col justify-between hover:shadow-md transition-all">
                <p class="text-xl text-slate-800 font-medium italic mb-8 leading-relaxed">"${item.quote}"</p>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h4 class="font-black text-xs uppercase tracking-widest text-slate-900">${item.name}</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">${item.title} • ${item.company}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Inject the cards twice to create a seamless infinite loop
    track.innerHTML = cardHtml + cardHtml;
}

document.addEventListener('DOMContentLoaded', initTestimonials);