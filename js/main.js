document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initFAQAccordion();
  initVideoFilters();
  initRecommendationTool();
  initCommunityVoting();
  initContactForm();
});

/* ==========================================
   NAVBAR & MOBILE MENU
   ========================================== */
function initNavbar() {
  const nav = document.querySelector('nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky Navbar background change on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      
      // Toggle icon
      const icon = menuToggle.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    // Close mobile menu when links are clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }
}

/* ==========================================
   SCROLL REVEAL ANIMATIONS (Intersection Observer)
   ========================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, no need to track it further
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }
}

/* ==========================================
   FAQ ACCORDION
   ========================================== */
function initFAQAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all other accordion items in the same section
      const siblingAccordions = item.parentElement.querySelectorAll('.accordion-item');
      siblingAccordions.forEach(sibling => {
        sibling.classList.remove('active');
        const siblingContent = sibling.querySelector('.accordion-content');
        if (siblingContent) {
          siblingContent.style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
      }
    });
  });
}

/* ==========================================
   VIDEOS SEARCH & CATEGORY FILTERS
   ========================================== */
function initVideoFilters() {
  const searchInput = document.getElementById('video-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const videoCards = document.querySelectorAll('.videos-grid .video-card');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  if (!videoCards.length) return; // Not on the videos page

  let activeCategory = 'all';
  let searchQuery = '';
  let visibleLimit = 6; // Initial number of visible videos
  
  function applyFilters() {
    let visibleCount = 0;
    let matchCount = 0;

    videoCards.forEach(card => {
      const category = card.dataset.category || 'all';
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = (title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        matchCount++;
        // Apply limit check for pagination
        if (matchCount <= visibleLimit) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      } else {
        card.style.display = 'none';
      }
    });

    // Check empty state
    const grid = document.querySelector('.videos-grid');
    let emptyState = document.getElementById('video-empty-state');
    
    if (matchCount === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'video-empty-state';
        emptyState.className = 'empty-state glass-panel reveal active';
        emptyState.innerHTML = `
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>No Videos Found</h3>
          <p>We couldn't find any videos matching "${searchQuery}" in this category.</p>
        `;
        grid.appendChild(emptyState);
      } else {
        emptyState.style.display = 'block';
      }
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Handle "Load More" button visibility
    if (loadMoreBtn) {
      if (matchCount > visibleLimit) {
        loadMoreBtn.style.display = 'inline-flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Category filter click listener
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  // Load More button action
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += 6; // Load 6 more items
      applyFilters();
    });
  }

  // Execute on load
  applyFilters();
}

/* ==========================================
   ANIME RECOMMENDATION TOOL (Mood Recommender)
   ========================================== */
function initRecommendationTool() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const recommendResult = document.getElementById('recommend-result');

  if (!moodBtns.length || !recommendResult) return; // Not on blog page

  // Recommendations Database
  const recommendations = {
    action: {
      title: "Solo Leveling (Sinhala Review)",
      genres: "Action / Fantasy / Shonen",
      desc: "If you love adrenaline-fueled fights, rapid level-up scales, and jaw-dropping boss encounters, Solo Leveling is the ultimate thrill ride.",
      img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"
    },
    funny: {
      title: "KonoSuba: God's Blessing on this Wonderful World!",
      genres: "Comedy / Isekai / Fantasy",
      desc: "A hilarious parody of typical fantasy anime. Expect absolute chaos, useless teammates, and non-stop laughs from start to finish.",
      img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80"
    },
    dark: {
      title: "Death Note (Sinhala Character Analysis)",
      genres: "Psychological / Thriller / Mystery",
      desc: "A legendary psychological battle of wits between a student with a notebook of death and an eccentric detective. Mature, tense, and absolute cinema.",
      img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&q=80"
    },
    romance: {
      title: "Kaguya-sama: Love Is War",
      genres: "Comedy / Romance / School Life",
      desc: "Two geniuses refuse to confess their love, treating romance like a high-stakes psychological war. A perfect blend of wholesome romance and rich comedy.",
      img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80"
    },
    mystery: {
      title: "Erased (Boku dake ga Inai Machi)",
      genres: "Mystery / Supernatural / Suspense",
      desc: "A gripping time-travel mystery about a young man sent back to his childhood to prevent a tragic series of kidnappings. Fast-paced and highly emotional.",
      img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80"
    }
  };

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mood = btn.dataset.mood;
      const rec = recommendations[mood];

      if (rec) {
        recommendResult.classList.remove('active');
        
        // Timeout to allow fade-out animation reset
        setTimeout(() => {
          recommendResult.innerHTML = `
            <div class="recommend-card">
              <img src="${rec.img}" alt="${rec.title}" class="recommend-img">
              <h4>${rec.title}</h4>
              <p class="recommend-genres">${rec.genres}</p>
              <p class="recommend-desc">${rec.desc}</p>
            </div>
          `;
          recommendResult.classList.add('active');
        }, 100);
      }
    });
  });
}

/* ==========================================
   COMMUNITY ANIME SUGGESTION VOTING BOARD
   ========================================== */
function initCommunityVoting() {
  const votingList = document.getElementById('voting-list');
  const suggestForm = document.getElementById('suggest-anime-form');
  const suggestInput = document.getElementById('new-anime-suggestion');

  if (!votingList) return; // Not on community page

  // Default Anime List if localStorage is empty
  const defaultAnime = [
    { id: 1, name: "Chainsaw Man (Season 2 Review Request)", creator: "Nipun LK", votes: 45 },
    { id: 2, name: "Attack on Titan: Sinhala Lore Explanation", creator: "Janith S.", votes: 32 },
    { id: 3, name: "Jujutsu Kaisen: Gojo Satoru Character Depth", creator: "Dinuka P.", votes: 28 },
    { id: 4, name: "Demon Slayer: Animation Quality Deep Dive", creator: "Asha M.", votes: 19 }
  ];

  // Load from localStorage or set defaults
  let animeSuggestions = JSON.parse(localStorage.getItem('animeSuggestions'));
  if (!animeSuggestions) {
    animeSuggestions = defaultAnime;
    localStorage.setItem('animeSuggestions', JSON.stringify(animeSuggestions));
  }

  // Load voted items tracking
  let votedIds = JSON.parse(localStorage.getItem('votedIds')) || [];

  function renderVotingList() {
    // Sort suggestions by votes descending
    animeSuggestions.sort((a, b) => b.votes - a.votes);
    
    votingList.innerHTML = '';
    
    animeSuggestions.forEach(anime => {
      const isVoted = votedIds.includes(anime.id);
      const voteItem = document.createElement('div');
      voteItem.className = 'voting-item glass-panel reveal active';
      voteItem.innerHTML = `
        <div class="vote-details">
          <h3>${anime.name}</h3>
          <span>Suggested by ${anime.creator}</span>
        </div>
        <div class="vote-actions">
          <span class="vote-count" id="vote-count-${anime.id}">${anime.votes}</span>
          <button class="upvote-btn ${isVoted ? 'voted' : ''}" data-id="${anime.id}">
            <i class="fa-solid fa-caret-up"></i>
          </button>
        </div>
      `;
      votingList.appendChild(voteItem);
    });

    // Reattach upvote event listeners
    const upvoteBtns = votingList.querySelectorAll('.upvote-btn');
    upvoteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const index = animeSuggestions.findIndex(a => a.id === id);
        
        if (index !== -1) {
          if (!votedIds.includes(id)) {
            // Upvote
            animeSuggestions[index].votes++;
            votedIds.push(id);
            btn.classList.add('voted');
          } else {
            // Remove upvote (toggle back)
            animeSuggestions[index].votes--;
            votedIds = votedIds.filter(vid => vid !== id);
            btn.classList.remove('voted');
          }
          
          localStorage.setItem('animeSuggestions', JSON.stringify(animeSuggestions));
          localStorage.setItem('votedIds', JSON.stringify(votedIds));
          
          // Re-render to sort and update counters
          renderVotingList();
        }
      });
    });
  }

  // Form submission for adding new suggestions
  if (suggestForm && suggestInput) {
    suggestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = suggestInput.value.trim();
      
      if (text.length < 3) {
        alert("Please enter a valid anime title or review suggestion (at least 3 characters).");
        return;
      }

      const newId = animeSuggestions.length ? Math.max(...animeSuggestions.map(a => a.id)) + 1 : 1;
      const newAnimeObj = {
        id: newId,
        name: text,
        creator: "Anonymous Fan",
        votes: 1
      };

      animeSuggestions.push(newAnimeObj);
      localStorage.setItem('animeSuggestions', JSON.stringify(animeSuggestions));
      
      // Auto upvote the newly created suggestion by this user
      votedIds.push(newId);
      localStorage.setItem('votedIds', JSON.stringify(votedIds));

      suggestInput.value = '';
      renderVotingList();
    });
  }

  // Initial render
  renderVotingList();
}

/* ==========================================
   CONTACT FORM VALIDATION
   ========================================== */
function initContactForm() {
  const form = document.getElementById('creator-contact-form');
  const successMsg = document.getElementById('contact-success-msg');

  if (!form) return; // Not on community/contact page

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let hasError = false;
    
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const animeInput = document.getElementById('contact-anime');
    const msgInput = document.getElementById('contact-message');

    // Reset error styling
    const groups = form.querySelectorAll('.form-group');
    groups.forEach(g => g.classList.remove('has-error'));

    // Validate Name
    if (nameInput.value.trim() === '') {
      nameInput.parentElement.classList.add('has-error');
      hasError = true;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.parentElement.classList.add('has-error');
      hasError = true;
    }

    // Validate Favorite Anime
    if (animeInput.value.trim() === '') {
      animeInput.parentElement.classList.add('has-error');
      hasError = true;
    }

    // Validate Message
    if (msgInput.value.trim().length < 10) {
      msgInput.parentElement.classList.add('has-error');
      hasError = true;
    }

    if (!hasError) {
      // Simulate form submission
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 5000);
        }
      }, 1500);
    }
  });
}
