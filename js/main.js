/* ============================================
   PetCalcHub — Shared JavaScript
   ============================================ */

// --- Ad Slot Manager ---
// By default, all ad slots are hidden.
// To activate ads, call AdManager.enable() and provide ad codes.
const AdManager = {
  enabled: false,

  enable: function(config) {
    this.enabled = true;
    document.querySelectorAll('.ad-slot, .ad-sidebar').forEach(el => {
      el.classList.add('active');
    });
    // Replace placeholder content with actual ad code if provided
    if (config) {
      this.injectAds(config);
    }
  },

  disable: function() {
    this.enabled = false;
    document.querySelectorAll('.ad-slot, .ad-sidebar').forEach(el => {
      el.classList.remove('active');
    });
  },

  injectAds: function(config) {
    if (config.inContent && document.getElementById('ad-in-content')) {
      document.getElementById('ad-in-content').querySelector('.ad-slot-inner').innerHTML = config.inContent;
    }
    if (config.sidebar && document.getElementById('ad-sidebar')) {
      document.getElementById('ad-sidebar').querySelector('.ad-sidebar-inner').innerHTML = config.sidebar;
    }
    if (config.bottom && document.getElementById('ad-bottom')) {
      document.getElementById('ad-bottom').querySelector('.ad-slot-inner').innerHTML = config.bottom;
    }
  }
};

// --- Navigation ---
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      const expanded = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function(e) {
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Dropdown menus
  document.querySelectorAll('.nav-dropdown-toggle').forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      const wasOpen = parent.classList.contains('open');

      // Close all other dropdowns
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));

      if (!wasOpen) {
        parent.classList.add('open');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
      const item = this.parentElement;
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// --- Unit Conversion Utilities ---
const Units = {
  kgToLbs: function(kg) { return kg * 2.20462; },
  lbsToKg: function(lbs) { return lbs / 2.20462; },
  cmToIn: function(cm) { return cm / 2.54; },
  inToCm: function(inches) { return inches * 2.54; },

  formatWeight: function(value, unit) {
    if (unit === 'lbs') {
      return Math.round(value * 10) / 10 + ' lbs';
    }
    return Math.round(value * 10) / 10 + ' kg';
  }
};

// --- AI Suggestion Engine ---
// Generates contextual pet care advice based on calculator results.
// In production, this could be replaced with an API call.
const AIEngine = {
  // Predefined suggestion templates keyed by scenario
  suggestions: {
    dogAge: {
      puppy: function(years) {
        return {
          title: 'Your Puppy is in a Critical Development Stage',
          items: [
            'Schedule vaccinations according to AAHA guidelines — your pup needs core vaccines at 6-8, 10-12, and 14-16 weeks.',
            'Begin basic obedience training now — puppies are most receptive to socialization between 3-16 weeks.',
            'Feed a high-quality puppy formula (not adult food) to support rapid growth and brain development.',
            'Schedule a spay/neuter consultation — most vets recommend the procedure between 6-12 months depending on breed size.',
            'Start crate training and establish a consistent potty schedule — puppies can hold their bladder for roughly their age in months + 1 hour.'
          ]
        };
      },
      adult: function(years) {
        return {
          title: 'Keeping Your Adult Dog Healthy & Active',
          items: [
            'Maintain annual wellness exams — bloodwork becomes increasingly important for early disease detection.',
            'Aim for at least 30-60 minutes of daily exercise, adjusted for breed energy level.',
            'Monitor weight closely — even 2-3 extra pounds can shorten a dog\'s lifespan by up to 2 years.',
            'Consider joint supplements (glucosamine/chondroitin) for medium and large breeds starting at age 5-6.',
            'Dental health matters — 80% of dogs show signs of dental disease by age 3. Brush teeth 2-3 times weekly.'
          ]
        };
      },
      senior: function(years) {
        return {
          title: 'Senior Dog Care — Quality of Life Matters Most',
          items: [
            'Switch to a senior-formulated diet with adjusted protein and lower calories to support aging organs.',
            'Schedule bi-annual vet visits — kidney function, liver values, and thyroid should be monitored every 6 months.',
            'Watch for signs of arthritis: reluctance to jump, stairs hesitation, or stiffness after resting.',
            'Consider cognitive support: omega-3 fatty acids, mental enrichment toys, and consistent routines help slow cognitive decline.',
            'Adjust exercise intensity — shorter, more frequent walks are better than one long session.'
          ]
        };
      }
    },
    catAge: {
      young: function(years) {
        return {
          title: 'Your Young Cat Needs Structure & Stimulation',
          items: [
            'Complete the kitten vaccination series — FVRCP boosters are critical through 16 weeks.',
            'Spay/neuter by 5-6 months to prevent unwanted litters and reduce spraying/territorial behavior.',
            'Provide at least 2-3 scratching posts in different orientations (vertical and horizontal).',
            'Introduce puzzle feeders to stimulate natural hunting instincts and prevent boredom.',
            'Establish a consistent feeding schedule — free-feeding leads to obesity in 60% of adult cats.'
          ]
        };
      },
      adult: function(years) {
        return {
          title: 'Adult Cat Wellness — Prevention is Key',
          items: [
            'Annual blood panels are essential — cats are masters at hiding illness until advanced stages.',
            'Maintain dental care — feline tooth resorption affects 30-70% of adult cats.',
            'Provide fresh water daily, ideally from a fountain — cats instinctively prefer running water.',
            'Keep litter boxes immaculate — scoop twice daily, full change weekly. Follow the n+1 rule.',
            'Watch for subtle signs of stress: overgrooming, hiding, or changes in litter box habits.'
          ]
        };
      },
      senior: function(years) {
        return {
          title: 'Senior Cat Care — Comfort & Monitoring',
          items: [
            'Screen for hyperthyroidism and kidney disease — both are common in cats over 10 and treatable if caught early.',
            'Provide heated beds and easy-access litter boxes (lower sides) for arthritic cats.',
            'Increase wet food ratio — senior cats benefit from higher moisture intake to support kidney function.',
            'Monitor weight weekly — unexplained weight loss is often the first sign of serious illness in senior cats.',
            'Keep routines consistent — senior cats are especially sensitive to environmental changes.'
          ]
        };
      }
    },
    calorie: {
      weightLoss: function() {
        return {
          title: 'Weight Loss Strategy for Your Pet',
          items: [
            'Target 1-2% body weight loss per week — faster loss risks hepatic lipidosis in cats and muscle wasting in dogs.',
            'Use a kitchen scale to measure food — eyeballing portions leads to 20-40% overfeeding.',
            'Replace 25% of kibble with green beans (dogs) or wet food (cats) to reduce calories while maintaining volume.',
            'Track weekly weigh-ins — use a baby scale for cats and small dogs for accuracy.',
            'Treats should never exceed 10% of daily calories — consider using part of the regular meal as "treats" during training.'
          ]
        };
      },
      maintenance: function() {
        return {
          title: 'Maintaining Your Pet\'s Ideal Weight',
          items: [
            'Re-calculate calorie needs after spay/neuter — metabolism drops 20-30% post-surgery.',
            'Adjust portions seasonally — indoor pets burn fewer calories in winter.',
            'Use body condition score (BCS) monthly — you should feel ribs with light pressure but not see them.',
            'Divide meals into 2-3 feedings per day to improve satiety and digestion.',
            'Rotate protein sources every 2-3 months to reduce food sensitivity risk while keeping the same calorie count.'
          ]
        };
      }
    },
    puppyWeight: function(weight, breedSize) {
      let title, items;
      if (breedSize === 'small') {
        title = 'Small Breed Puppy Growth Guide';
        items = [
          'Small breeds reach adult size by 9-12 months — growth plates close earlier than large breeds.',
          'Feed small-breed puppy formula — smaller kibble size prevents choking and ensures proper nutrient density.',
          'Monitor for hypoglycemia — toy breeds are prone to low blood sugar; feed 3-4 small meals daily.',
          'Start dental care early — small breeds are 5x more likely to develop periodontal disease.',
          'Your puppy\'s predicted weight: ' + weight + ' — confirm with your vet at the 6-month wellness check.'
        ];
      } else if (breedSize === 'medium') {
        title = 'Medium Breed Puppy Growth Guide';
        items = [
          'Medium breeds reach adult size by 12-15 months — steady, consistent growth is ideal.',
          'Avoid over-supplementing calcium — excess can cause skeletal abnormalities in growing puppies.',
          'Start joint-friendly exercise — avoid forced running on hard surfaces until growth plates close.',
          'Begin loose-leash training now — medium breeds often become strong pullers without early training.',
          'Your puppy\'s predicted weight: ' + weight + ' — growth rate should be steady, not spiky.'
        ];
      } else {
        title = 'Large/Giant Breed Puppy Growth Guide';
        items = [
          'Large breeds reach adult size by 18-24 months — slower growth is healthier for joint development.',
          'Feed large-breed puppy formula with controlled calcium:phosphorus ratio (1.2:1 ideal).',
          'NO forced running or jumping until 12-18 months — protects developing hip and elbow joints.',
          'Elevated feeders may increase bloat risk — floor-level feeding is recommended for deep-chested breeds.',
          'Your puppy\'s predicted weight: ' + weight + ' — consult your vet about appropriate growth rate for this breed category.'
        ];
      }
      return { title, items };
    },
    pregnancy: function(daysRemaining) {
      if (daysRemaining < 0) {
        return {
          title: 'Whelping May Be Imminent — Be Prepared',
          items: [
            'Monitor for signs of stage 1 labor: restlessness, nesting, panting, refusal to eat (lasts 6-12 hours).',
            'Have your vet\'s emergency number ready — know the route to the nearest 24-hour animal hospital.',
            'Prepare a whelping box in a quiet, warm (85°F) area with clean bedding.',
            'Have supplies ready: clean towels, heating pad, bulb syringe, iodine for umbilical cords, digital scale.',
            'Track temperature twice daily — a drop below 99°F usually indicates labor within 24 hours.'
          ]
        };
      }
      return {
        title: 'Pregnancy Milestones & Care Tips',
        items: [
          'Week 4: Ultrasound can confirm pregnancy and estimate litter size.',
          'Week 5-6: Switch to high-quality puppy food — increase portions by 25-50% in the final trimester.',
          'Week 7: Begin taking weekly photos of mom\'s profile to track abdominal growth.',
          'Week 8: Set up the whelping box and let mom explore it — she needs to feel comfortable there.',
          daysRemaining + ' days remaining — schedule a pre-whelping vet check if you haven\'t already.'
        ]
      };
    },
    chocolate: function(riskLevel) {
      if (riskLevel === 'high' || riskLevel === 'severe') {
        return {
          title: '⚠️ Immediate Veterinary Attention Required',
          items: [
            'DO NOT wait for symptoms — by the time signs appear, treatment is less effective.',
            'Call your veterinarian or animal poison control immediately: ASPCA (888) 426-4435 or Pet Poison Helpline (855) 764-7661.',
            'If instructed, you may be told to induce vomiting with 3% hydrogen peroxide — ONLY do this under veterinary guidance.',
            'Bring the chocolate wrapper to the vet — knowing the exact type and amount helps determine treatment.',
            'Treatment options include: induced vomiting, activated charcoal, IV fluids, anti-seizure medication, and cardiac monitoring.'
          ]
        };
      } else if (riskLevel === 'moderate') {
        return {
          title: 'Monitor Closely — Contact Your Vet',
          items: [
            'Watch for symptoms: vomiting, diarrhea, increased thirst, restlessness, rapid breathing.',
            'Call your vet to discuss — they may recommend bringing your dog in for observation.',
            'Do not induce vomiting at home without veterinary approval — it can cause complications.',
            'Keep your dog calm and comfortable — excitement increases heart rate and toxin absorption.',
            'Symptoms typically appear within 6-12 hours and can last up to 72 hours.'
          ]
        };
      }
      return {
        title: 'Low Risk — But Stay Vigilant',
        items: [
          'At this dose, serious toxicity is unlikely — but monitor for mild GI upset over the next 24 hours.',
          'Withhold food for 6-8 hours if mild vomiting occurs, then reintroduce a bland diet (boiled chicken + rice).',
          'Ensure access to fresh water — mild diarrhea can cause dehydration.',
          'Prevention: store all chocolate in sealed containers above counter height — dogs can open lower cabinets.',
          'Bookmark the ASPCA Poison Control number (888-426-4435) for future emergencies.'
        ]
      };
    },
    bmi: function(score, idealWeight) {
      if (score <= 3) {
        return {
          title: 'Underweight — Safe Weight Gain Plan',
          items: [
            'Target gradual gain of 1-2% body weight per week — rapid gain can cause metabolic stress.',
            'Increase daily calories by 20-25% and re-assess body condition in 2 weeks.',
            'Add healthy calorie sources: cooked eggs, plain pumpkin, sardines (packed in water, no salt).',
            'Rule out underlying conditions: parasites, dental pain, IBD, hyperthyroidism (cats), EPI (dogs).',
            'Feed 3-4 smaller meals per day rather than 1-2 large ones to improve nutrient absorption.'
          ]
        };
      } else if (score <= 5) {
        return {
          title: 'Ideal Weight — Maintenance Strategy',
          items: [
            'Excellent! Your pet is at a healthy weight — ideal BCS is 4-5 on a 9-point scale.',
            'Weigh monthly and adjust portions if weight fluctuates more than 5% in either direction.',
            'Maintain current exercise routine — consistency is key for long-term weight management.',
            'Take a "rib check" photo monthly — a visual record helps catch gradual changes.',
            'Remember that ideal body condition adds an average of 1.8 years to a dog\'s lifespan.'
          ]
        };
      } else if (score <= 7) {
        return {
          title: 'Overweight — Begin Weight Loss Gradually',
          items: [
            'Target safe weight loss of 1-2% body weight per week.',
            'Reduce daily calories to 80% of maintenance — or use a weight-management formula food.',
            'Increase low-impact exercise by 15-20 minutes daily — swimming is excellent for overweight dogs.',
            'Replace high-calorie treats with baby carrots, green beans, or ice cubes.',
            'Your target weight is approximately ' + idealWeight + ' — this is achievable in 8-16 weeks with consistency.'
          ]
        };
      }
      return {
        title: 'Obese — Structured Weight Loss Plan Needed',
        items: [
          'Consult your vet for a supervised weight loss program — rapid weight loss in obese pets can cause hepatic lipidosis.',
          'Consider prescription weight-management food — these are formulated for satiety with fewer calories.',
          'Eliminate all human food and treats immediately — use a portion of regular kibble as "treats."',
          'Track everything: use a food diary app to log every calorie, including "just a taste" moments.',
          'Your target weight is approximately ' + idealWeight + ' — commit to monthly vet weigh-ins for accountability.'
        ]
      };
    },
    dogWater: {
      default: function(params) {
        const { weightKg, weightLbs, totalMl, totalCups, dietType, activityLevel } = params;
        const tips = [
          `A ${weightLbs.toFixed(1)} lb dog needs ~${totalCups} cups of water daily.`,
          'Dogs eating dry food need more water than those on wet/canned food.',
          'Place multiple water bowls around the house — some dogs prefer drinking away from their food area.',
          'Clean water bowls daily — biofilm builds up quickly and can harbor harmful bacteria.',
          'Watch for signs of dehydration: dry gums, loss of skin elasticity, lethargy. Offer water immediately if noticed.'
        ];
        return {
          title: 'Keep Your Dog Hydrated & Healthy',
          items: tips
        };
      }
    },
    catWater: {
      default: function(params) {
        const { weight, unit } = params;
        const weightKg = unit === 'lbs' ? weight / 2.20462 : weight;
        return {
          title: 'Cats Need Encouragement to Drink',
          items: [
            `Your cat needs about ${Math.round(weightKg * 40 / 100) / 10} cups of water daily. Cats have a low thirst drive — they evolved as desert animals.`,
            'Feed wet/canned food to increase water intake — a cat on 100% dry food is mildly dehydrated 24/7.',
            'Use a cat fountain — running water entices many cats to drink more. Most cats prefer moving water.',
            'Place water bowls AWAY from food and litter boxes — cats instinctively avoid water near food or waste areas.',
            'Flavor the water with a splash of tuna juice or low-sodium broth to encourage drinking.'
          ]
        };
      }
    },
    dogLife: {
      default: function(params) {
        return {
          title: 'Maximize Your Dog\'s Lifespan',
          items: [
            'Keep your dog at ideal weight — studies show lean dogs live 1.8-2.5 years longer than overweight dogs.',
            'Prioritize dental care — periodontal disease is linked to heart, liver, and kidney disease in dogs.',
            'Exercise daily but avoid "weekend warrior" syndrome — consistent moderate exercise is better than sporadic intense activity.',
            'Feed a high-quality diet appropriate for your dog\'s life stage. Nutrition is the #1 factor you can control for longevity.',
            'Build a relationship with a trusted vet — preventive care catches issues before they become expensive, life-threatening problems.'
          ]
        };
      }
    },
    petInsurance: {
      default: function(params) {
        const { hasCondition } = params;
        return {
          title: 'Make Informed Pet Insurance Decisions',
          items: [
            'Enroll early — premiums are lower for young, healthy pets, and pre-existing conditions are never covered.',
            'Choose annual limit over per-incident limit — one serious accident can exceed per-incident caps quickly.',
            hasCondition ? 'Since your pet has a pre-existing condition, look for insurers who cover curable conditions after 12 months symptom-free.' : 'Compare deductibles: higher deductible = lower premium but more out-of-pocket costs when you file a claim.',
            'Check if the plan covers hereditary/congenital conditions — important for purebred dogs.',
            'Read the fine print on "wellness" add-ons — some are just prepaid vet visits at retail prices, not real insurance.'
          ]
        };
      }
    }
  },

  generate: function(category, subcategory, params) {
    if (!this.suggestions[category] || !this.suggestions[category][subcategory]) {
      return this.getGenericAdvice();
    }
    const result = this.suggestions[category][subcategory](params);
    return result;
  },

  getGenericAdvice: function() {
    return {
      title: 'Personalized Pet Care Tips',
      items: [
        'Schedule regular veterinary check-ups — prevention is always more affordable than treatment.',
        'Maintain up-to-date vaccinations and parasite prevention year-round.',
        'Provide fresh water daily and clean food bowls after each meal.',
        'Spend quality time with your pet daily — mental stimulation is as important as physical exercise.',
        'Keep a pet first-aid kit at home with basics: gauze, antiseptic wipes, digital thermometer, and tweezers.'
      ]
    };
  }
};

// --- Display AI Suggestions ---
function displayAISuggestions(category, subcategory, params) {
  const container = document.getElementById('ai-suggestions');
  if (!container) return;

  const result = AIEngine.generate(category, subcategory, params);
  if (!result) return;

  container.innerHTML = `
    <div class="ai-box">
      <div class="ai-box-header">
        <span class="ai-box-badge">AI</span>
        <span class="ai-box-title">${result.title}</span>
      </div>
      <div class="ai-content">
        <ul>
          ${result.items.map(item => '<li>' + item + '</li>').join('')}
        </ul>
      </div>
      <div class="ai-disclaimer">
        This AI-generated advice is for informational purposes only and does not replace professional veterinary guidance. 
        Always consult your veterinarian for health decisions regarding your pet.
      </div>
    </div>
  `;

  // Scroll AI suggestions into view
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- Weight Unit Manager ---
const WeightUnit = {
  current: 'lbs',

  init: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttons = container.querySelectorAll('.unit-toggle button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.current = btn.dataset.unit;
        this.onChange && this.onChange(this.current);
      });
    });
  },

  onChange: null
};

// --- Formatting Helpers ---
function formatNumber(n, decimals) {
  decimals = decimals || 1;
  return Number(n).toFixed(decimals);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// --- Scroll to results ---
function scrollToResults() {
  const resultIds = ['ageResult', 'calorieResult', 'pregResult', 'toxResult', 'bmiResult', 'costResult', 'weightResult'];
  for (const id of resultIds) {
    const el = document.getElementById(id);
    if (el && el.style.display !== 'none' && el.innerHTML.trim() !== '') {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
  }
}
