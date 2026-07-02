/**
 * Shared site behavior for all pages.
 * Loaded with `defer` in the <head>, so it runs after the DOM is parsed.
 * Elements that only exist on some pages (e.g. the speaker modal) are guarded.
 */

// Initialize Lucide icons
lucide.createIcons();

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('show');
}

// Speaker bio modal (only present on the About page)
function toggleSpeakerBio(button) {
    const card = button.closest('.speaker-card');
    const name = card.querySelector('h3').textContent;
    const affiliation = card.querySelector('.affiliation').textContent;
    const bio = card.querySelector('.speaker-bio-content p').textContent;
    const img = card.querySelector('.speaker-image-col img');

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalAffiliation').textContent = affiliation;
    document.getElementById('modalBio').textContent = bio;

    const avatar = document.getElementById('modalAvatar');
    if (img) {
        avatar.src = img.src;
        avatar.alt = img.alt;
        avatar.style.display = 'block';
    } else {
        avatar.style.display = 'none';
    }

    document.getElementById('speakerModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSpeakerModal() {
    const modal = document.getElementById('speakerModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Modal listeners (guarded — the modal only exists on the About page)
const speakerModal = document.getElementById('speakerModal');
if (speakerModal) {
    speakerModal.addEventListener('click', function (e) {
        if (e.target === this) closeSpeakerModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSpeakerModal();
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('show');
    });
});

// Smooth scroll offset for fixed navbar (section deep-link icons are handled separately)
document.querySelectorAll('a[href^="#"]:not(.anchor-link)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 70;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Section deep-link icons: copy the section's URL to the clipboard with brief feedback
document.querySelectorAll('.anchor-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const id = this.getAttribute('href');
        const url = window.location.origin + window.location.pathname + id;
        history.replaceState(null, '', id);

        const done = () => {
            this.classList.add('copied');
            setTimeout(() => this.classList.remove('copied'), 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
            done();
        }
    });
});

// Author <-> affiliation cross-highlight: click/tap to pin a group (touch-friendly; complements CSS hover)
(function () {
    let pinnedEl = null;

    function clearPins() {
        document.querySelectorAll('.affil-pinned').forEach(el => el.classList.remove('affil-pinned'));
        pinnedEl = null;
    }

    function pinGroup(el) {
        const scope = el.closest('.paper-item, .schedule-talk-list li');
        if (!scope) return;
        el.getAttribute('data-affil').split(/\s+/).forEach(idx => {
            if (!idx) return;
            scope.querySelectorAll('[data-affil~="' + idx + '"]').forEach(t => t.classList.add('affil-pinned'));
        });
    }

    document.querySelectorAll('.author[data-affil], .affil[data-affil]').forEach(el => {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            const wasPinned = (el === pinnedEl);
            clearPins();
            if (!wasPinned) { pinnedEl = el; pinGroup(el); }
        });
    });

    // Click anywhere else clears the pinned highlight
    document.addEventListener('click', clearPins);
})();
