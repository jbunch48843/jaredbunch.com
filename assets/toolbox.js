const toolboxData = {
    'blueprints': {
        category: 'Method',
        title: 'Service Blueprints',
        description: 'In industrial software, the user experience starts long before someone clicks a button. I map out the entire ecosystem: including the handoffs between people, internal processes, and the tech stack. This helps me see where the real friction lives.',
        impact: 'Identifying a data silo issue that was causing a 65% delay in factory planning cycles.',
        shape: 'blueprints'
    },
    'research': {
        category: 'Insights',
        title: 'Learning from Users',
        description: 'I don’t just ask users what they want. I watch what they do when the software fails them. Whether it is 1 on 1 interviews or large scale surveys, I turn thousands of raw data points into a clear path for the product team.',
        impact: 'Developed a lighthouse customer program that provided a direct feedback loop for the Drawing Automation project.',
        shape: 'research'
    },
    'governance': {
        category: 'Systems',
        title: 'Making it Scale',
        description: 'Design systems are useless if they are not being used. I set up the rules, workflows, and communication channels that allow massive, global teams to build consistent software at speed.',
        impact: 'Standardized UI components across global teams, reducing design to dev handoff time.',
        shape: 'governance'
    },
    'mapping': {
        category: 'Architecture',
        title: 'Solving Complexity',
        description: 'I specialize in taking spaghetti systems: software that has grown too complex for its own good: and reorganizing the information so it finally makes sense to a human being again.',
        impact: 'Reduced cognitive load in legacy engineering tools by automating 40% of manual drafting tasks.',
        shape: 'mapping'
    },
    'visioning': {
        category: 'Strategy',
        title: 'Future Visioning',
        description: 'I use storyboards and prototypes to show a team not just what we are building today, but where the product will be in three years. It is the ultimate tool for getting executives and engineers on the same page.',
        impact: 'Successfully aligned a Division VP and other stakeholders on a multi year cloud strategy.',
        shape: 'visioning'
    },
    'workshops': {
        category: 'Leadership',
        title: 'Alignment Workshops',
        description: 'Innovation happens when everyone feels safe enough to disagree. I lead sessions that bridge the gap between technical limits and business goals to make sure we all move in one direction.',
        impact: 'Used a disagree and commit framework to keep the Drawing Automation MVP on schedule despite stakeholder friction.',
        shape: 'workshops'
    }
};

function renderPlaceholder(type) {
    const base = "relative w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden";
    
    const shapes = {
        'blueprints': `<div class="${base}">
            <div class="absolute w-1/2 h-0.5 bg-slate-200 rotate-45"></div>
            <div class="absolute w-1/2 h-0.5 bg-slate-200 -rotate-45"></div>
            <div class="z-10 flex gap-4">
                <div class="w-8 h-8 rounded-lg bg-blue-500 shadow-lg"></div>
                <div class="w-8 h-8 rounded-lg bg-slate-800 shadow-lg"></div>
                <div class="w-8 h-8 rounded-lg bg-emerald-500 shadow-lg"></div>
            </div>
        </div>`,
        'research': `<div class="${base}">
            <div class="grid grid-cols-2 gap-2">
                <div class="w-12 h-12 bg-yellow-200 shadow-sm -rotate-3"></div>
                <div class="w-12 h-12 bg-blue-100 shadow-sm rotate-6"></div>
                <div class="w-12 h-12 bg-emerald-100 shadow-sm -rotate-6"></div>
                <div class="w-12 h-12 bg-rose-100 shadow-sm rotate-3"></div>
            </div>
        </div>`,
        'governance': `<div class="${base} p-12">
            <div class="grid grid-cols-3 gap-4 w-full">
                ${Array(9).fill('<div class="h-4 bg-slate-200 rounded"></div>').join('')}
            </div>
        </div>`,
        'mapping': `<div class="${base}">
            <div class="w-3/4 h-0.5 bg-slate-200 absolute"></div>
            <div class="flex gap-8 z-10">
                <div class="w-4 h-4 rounded-full bg-slate-800"></div>
                <div class="w-4 h-4 rounded-full bg-slate-800"></div>
                <div class="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
        </div>`,
        'visioning': `<div class="${base}">
            <div class="w-24 h-24 rounded-full bg-blue-500/10 animate-ping absolute"></div>
            <div class="w-12 h-12 bg-blue-600 rounded-xl rotate-45 shadow-xl flex items-center justify-center">
                <div class="w-4 h-4 bg-white rounded-full"></div>
            </div>
        </div>`,
        'workshops': `<div class="${base}">
            <div class="flex -space-x-4">
                <div class="w-16 h-16 rounded-full bg-slate-800 border-4 border-white shadow-xl"></div>
                <div class="w-16 h-16 rounded-full bg-blue-500 border-4 border-white shadow-xl"></div>
                <div class="w-16 h-16 rounded-full bg-emerald-500 border-4 border-white shadow-xl"></div>
            </div>
        </div>`
    };
    
    return shapes[type] || shapes['governance'];
}

function openModal(id) {
    const data = toolboxData[id];
    if (!data) return;

    document.getElementById('modalCategory').innerText = data.category;
    document.getElementById('modalTitle').innerText = data.title;
    document.getElementById('modalDescription').innerText = data.description;
    document.getElementById('modalImpact').querySelector('p').innerText = data.impact;
    
    const imageContainer = document.getElementById('modalImage');
    imageContainer.innerHTML = renderPlaceholder(data.shape);

    document.getElementById('toolboxModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('toolboxModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}