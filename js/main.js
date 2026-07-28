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
    },
    petTravelCost: {
      default: function(params) {
        const { petType, travelMode, distance, tripDays, totalCost } = params;
        const items = [
          'Book pet-friendly accommodations early — rooms with pet amenities sell out first during peak travel seasons.',
          'Pack a pet travel kit: food, water, bowls, leash, waste bags, medications, vaccination records, and a recent photo.',
          travelMode === 'plane_cabin' || travelMode === 'plane_cargo' ? 'For air travel: check your airline\'s pet policy 2-4 weeks before departure. Snub-nosed breeds may face restrictions.' : 'For road trips: plan rest stops every 2-3 hours for potty breaks and water. Never leave your pet in a parked car.',
          'Microchip your pet and ensure ID tags are up-to-date with your current phone number before traveling.',
          tripDays > 5 ? `For a ${tripDays}-day trip, consider pet travel insurance that covers emergency vet visits at your destination.` : 'Keep your regular vet\'s contact info handy — they can often advise by phone if minor issues arise during travel.'
        ];
        return {
          title: 'Travel Smart With Your Pet — Budget & Safety Tips',
          items
        };
      }
    },
    petSitting: {
      default: function(params) {
        const { serviceType, petType, numDays, location } = params;
        const items = [
          'Book pet sitters 2-4 weeks in advance — quality sitters fill up fast, especially during holidays and summer.',
          'Schedule a meet-and-greet before booking — watch how the sitter interacts with your pet and check their references.',
          serviceType === 'boarding' ? 'For boarding: bring your pet\'s own food, bed, and a familiar toy to reduce stress in the new environment.' : 'For in-home sitting: leave detailed written instructions for feeding, medications, emergency contacts, and your pet\'s routine.',
          location === 'urban' ? 'In major metro areas, rates are higher but you have more options. Consider a sitter 1-2 miles outside the city center for better rates.' : 'Compare at least 3 sitters using platforms like Rover or Wag — read reviews carefully and verify insurance/bonding.',
          numDays > 7 ? `For a ${numDays}-day absence, arrange a backup contact (friend or neighbor) in case the sitter has an emergency.` : 'Leave your vet\'s contact info and a signed emergency care authorization with the sitter.'
        ];
        return {
          title: 'Find the Right Pet Care While You\'re Away',
          items
        };
      }
    },
    aquarium: {
      default: function(params) {
        const { actualGal, tankType, maxFishInches, heaterWatts, filterGPH } = params;
        const items = [
          `Your ${actualGal.toFixed(1)} gallon tank needs cycling before adding fish — the nitrogen cycle takes 4-8 weeks. Test ammonia, nitrite, and nitrate levels weekly.`,
          tankType === 'planted' ? 'For a planted tank: invest in quality substrate (aquasoil), CO₂ injection, and a full-spectrum LED. Start with easy plants: Anubias, Java Fern, Amazon Sword.' : tankType === 'saltwater_reef' ? 'Reef tanks require patience — wait at least 3-4 months before adding sensitive corals. Maintain stable parameters: salinity 1.024-1.026, alkalinity 8-12 dKH, calcium 400-450 ppm.' : 'Perform 25-30% weekly water changes to maintain water quality. Use a gravel vacuum to remove debris from the substrate.',
          `With ${maxFishInches}" of stocking capacity, add fish in 2-3 small groups over several weeks. Quarantine new fish for 2 weeks before adding to the main tank.`,
          filterGPH > 300 ? `Your filter should turn over ${filterGPH} GPH — clean the filter media monthly in tank water (not tap water) to preserve beneficial bacteria.` : 'A sponge filter or small HOB filter works well for this tank size. Clean gently to preserve the biological filtration.',
          heaterWatts > 150 ? 'Place your heater near the filter outflow for even heat distribution. Use a separate thermometer to verify temperature — heater thermostats can be inaccurate by 2-4°F.' : 'A reliable heater with an external thermostat controller adds an extra safety layer — heater failures are the #1 cause of tank crashes.'
        ];
        return {
          title: 'Build a Thriving Aquarium Ecosystem',
          items
        };
      }
    },
    foodCost: {
      default: function(params) {
        const costPerDay = params;
        return {
          title: 'Smart Pet Food Shopping Tips',
          items: [
            'Always compare cost per 1,000 kcal — not cost per bag. A larger bag may seem cheaper but could be less cost-effective if it has lower calorie density.',
            'Buy in bulk during sales — pet food goes on sale seasonally. Stock up when you see 20-30% off, but check the expiration date first.',
            'Consider warehouse clubs (Costco, Sam\'s Club) or auto-ship subscriptions for 5-15% recurring savings on premium brands.',
            `At ${costPerDay ? '$' + costPerDay + ' per day' : 'your current rate'}, quality food is one of the best investments in your pet's long-term health — vet bills from poor nutrition cost far more.`,
            'Rotate protein sources every 2-3 months within the same quality tier — this reduces food sensitivity risk and provides more complete amino acid profiles.'
          ]
        };
      }
    },
    catLife: {
      default: function(params) {
        return {
          title: 'Help Your Cat Live a Longer, Healthier Life',
          items: [
            'Indoor cats live 12-20 years on average — about 3x longer than outdoor cats (4-6 years). Keeping cats indoors is the single biggest longevity factor.',
            'Maintain ideal weight — obesity reduces a cat\'s lifespan by 2-3 years and increases diabetes risk 4x.',
            'Annual bloodwork catches kidney disease, hyperthyroidism, and diabetes early — all common, treatable conditions in senior cats.',
            'Dental disease affects 70% of cats by age 3 and is linked to heart, kidney, and liver disease. Brush teeth or use VOHC-approved dental treats.',
            'Provide environmental enrichment: vertical spaces (cat trees), scratching posts, puzzle feeders, and 10-15 minutes of interactive play daily.'
          ]
        };
      }
    },
    dogBreedCalorie: {
      default: function(params) {
        const { breedName, calories, lifeStage } = params;
        const tips = [
          `A ${breedName} needs approximately ${calories} kcal/day at this life stage — adjust based on activity and body condition.`,
          'Use a kitchen scale to weigh food — measuring cups are inaccurate by up to 25%, a leading cause of obesity.',
          'Split daily calories into 2 meals for adults, 3-4 meals for puppies and seniors to support stable blood sugar.',
          'Re-calculate after spay/neuter (metabolism drops 20-30%), at life stage transitions, and after any 5% weight change.',
          'Treats should be ≤10% of daily calories. For training, use part of the daily kibble allowance instead of extra treats.'
        ];
        return {
          title: `${breedName}-Specific Nutrition Guide`,
          items: tips
        };
      }
    },
    chocolate: {
      high: function(doseMgKg) {
        return {
          title: '🚨 Severe Chocolate Toxicity Risk — Seek Emergency Vet Care',
          items: [
            `At ${Math.round(doseMgKg)} mg/kg theobromine, your dog is at high risk for seizures, dangerous heart arrhythmias, and potentially death. This is a medical emergency.`,
            'Call your veterinarian or an animal poison control hotline (ASPCA: 888-426-4435) IMMEDIATELY — do not wait for symptoms to appear.',
            'If ingestion was within the last 1-2 hours, the vet may induce vomiting and give activated charcoal to limit absorption.',
            'Hospitalization with IV fluids, heart monitoring, and anti-seizure medication is often required for 24-48 hours.',
            'Dark, baker\'s, and semi-sweet chocolate are the most dangerous — keep all cocoa products locked away.'
          ]
        };
      },
      moderate: function(doseMgKg) {
        return {
          title: '⚠️ Moderate Chocolate Toxicity — Vet Care Recommended',
          items: [
            `At ${Math.round(doseMgKg)} mg/kg theobromine, expect restlessness, elevated heart rate, vomiting, or diarrhea within 6-12 hours.`,
            'Contact your vet for guidance — they may recommend bringing your dog in for monitoring and supportive care.',
            'Watch closely for worsening signs: tremors, racing heart, or inability to settle.',
            'Withhold further treats and keep your dog calm and hydrated while you seek advice.',
            'Note the type and amount of chocolate eaten — this helps your vet calculate the exact theobromine dose.'
          ]
        };
      },
      low: function(doseMgKg) {
        return {
          title: '✅ Low Chocolate Exposure — Monitor at Home',
          items: [
            `At ${Math.round(doseMgKg)} mg/kg theobromine, serious toxicity is unlikely, but mild stomach upset is possible.`,
            'Monitor for vomiting, diarrhea, restlessness, or increased thirst over the next 12-24 hours.',
            'Ensure fresh water is available and withhold rich treats for the day.',
            'If any concerning symptoms develop, call your vet — better safe than sorry.',
            'White chocolate is low-risk (minimal theobromine); milk chocolate is less dangerous than dark/baker\'s chocolate per ounce.'
          ]
        };
      }
    },
    bmi: {
      underweight: function(idealLbs) {
        return {
          title: 'Your Pet is Underweight — Time to Build Healthy Weight',
          items: [
            `Target ideal weight is around ${idealLbs} lbs. A BCS under 4 suggests your pet needs more calories or a health check.`,
            'Rule out medical causes first — parasites, dental disease, hyperthyroidism (cats), or GI issues can cause weight loss.',
            'Increase portion sizes gradually (10-15%) and consider a calorie-dense, high-quality diet.',
            'Feed smaller, more frequent meals if appetite is poor.',
            'Re-weigh in 2 weeks — steady, gradual gain is healthier than rapid weight changes.'
          ]
        };
      },
      ideal: function(idealLbs) {
        return {
          title: 'Great — Your Pet is at a Healthy Weight!',
          items: [
            `Maintaining ${idealLbs} lbs is excellent. Pets at ideal BCS live longer with fewer joint, diabetes, and heart problems.`,
            'Keep portions consistent and measure food with a scale — "eyeballing" leads to gradual weight creep.',
            'Treats should stay under 10% of daily calories.',
            'Maintain a regular exercise routine appropriate to age and breed.',
            'Re-check body condition monthly and adjust food as activity or metabolism changes.'
          ]
        };
      },
      overweight: function(idealLbs) {
        return {
          title: 'Your Pet is Overweight — A Weight Plan Helps',
          items: [
            `Ideal weight is closer to ${idealLbs} lbs. Even a few extra pounds raises diabetes, arthritis, and heart risks.`,
            'Cut daily calories by 10-20% and switch to a measured, lower-fat diet — never crash diet.',
            'Increase exercise gradually: longer walks, more play sessions.',
            'Replace high-cal treats with veggies (green beans, carrots) or portioned kibble from the daily allowance.',
            'Aim for 1-2% body weight loss per week; re-weigh monthly and celebrate small wins.'
          ]
        };
      },
      obese: function(idealLbs) {
        return {
          title: '⚠️ Obesity — Veterinary-Guided Weight Loss Recommended',
          items: [
            `Target ${idealLbs} lbs means significant loss is needed. Obesity shortens lifespan and stresses joints and organs.`,
            'Book a vet visit to rule out hypothyroidism and create a safe, structured weight-loss plan.',
            'Use a prescription or veterinary weight-management diet formulated to keep your pet full on fewer calories.',
            'Strictly measure every meal and eliminate table scraps and free-feeding.',
            'Low-impact exercise (short frequent walks, swimming) protects joints while burning fat.'
          ]
        };
      }
    },
    pregnancy: {
      pregnancy: function(daysRemaining) {
        return {
          title: 'Supporting a Healthy Pregnancy & Whelping',
          items: [
            `About ${Math.round(daysRemaining)} days remain. Switch the mom-to-be to a high-quality puppy/kitten formula in the last 3 weeks — she needs the extra calories and calcium.`,
            'Weigh her weekly; a steady gain is normal, but sudden changes warrant a vet check.',
            'Prepare a quiet, warm, low-traffic "whelping box" about a week before the due date.',
            'Learn the warning signs of dystocia (difficulty birthing): strong straining >30 min without a puppy, or >2-4 hours between babies.',
            'Have your vet\'s emergency number and a puppy/kitten resuscitation kit ready before labor begins.'
          ]
        };
      }
    },
    grapeToxicity: {
      high: function() {
        return {
          title: '🚨 Grape/Raisin Exposure — Emergency Risk of Kidney Failure',
          items: [
            'Grapes, raisins, currants, and sultanas can cause acute, potentially fatal kidney failure in dogs — and NO safe dose has been established.',
            'Call your vet or Pet Poison Helpline NOW. Even a single grape can be dangerous for a small dog.',
            'If recent (within 1-2 hours), the vet may induce vomiting and give activated charcoal.',
            'Expect 48-72 hours of IV fluid therapy to flush and protect the kidneys, plus bloodwork monitoring.',
            'Check labels carefully — grapes hide in trail mix, baked goods, and some medications (e.g., zante currants).'
          ]
        };
      },
      low: function() {
        return {
          title: '⚠️ Grape/Raisin Exposure — Monitor Closely',
          items: [
            'Any grape or raisin ingestion is treated cautiously because toxicity is unpredictable and dose-independent.',
            'Contact your vet with the exact amount and your pet\'s weight — they will advise whether to induce vomiting.',
            'Watch for vomiting, lethargy, decreased appetite, and reduced urination over the next 24-72 hours.',
            'Increase water access to support kidney flushing if advised by your vet.',
            'Keep all grape products, including wine and raisin bread, completely out of reach.'
          ]
        };
      }
    },
    ibuprofenToxicity: {
      high: function() {
        return {
          title: '🚨 Ibuprofen (Advil) Overdose — Life-Threatening Emergency',
          items: [
            'Ibuprofen is extremely toxic to dogs and cats — even one or two tablets can cause severe stomach ulcers, internal bleeding, and kidney failure.',
            'Rush to an emergency vet immediately. Do NOT give anything by mouth or induce vomiting without direction.',
            'Treatment includes aggressive IV fluids, gastroprotectants (e.g., omeprazole), and possibly hospitalization for kidney support.',
            'Cats are uniquely sensitive — never give any human NSAID to a cat.',
            'Store all medications in closed cabinets; pets can chew through pill bottles.'
          ]
        };
      },
      low: function() {
        return {
          title: '⚠️ Ibuprofen Exposure — Vet Assessment Needed',
          items: [
            'Even low doses of ibuprofen damage the pet stomach lining and kidneys over time — there is no safe OTC dose for pets.',
            'Call your vet with the strength (mg) and number of tablets ingested versus your pet\'s weight.',
            'Watch for vomiting (possibly bloody), black tarry stool, lethargy, and reduced drinking/urination.',
            'Your vet may recommend examination, bloodwork, and protective medication even if symptoms aren\'t yet visible.',
            'Use only vet-prescribed NSAIDs (e.g., carprofen) specifically dosed for your pet.'
          ]
        };
      }
    },
    onionToxicity: {
      high: function() {
        return {
          title: '🚨 Onion/Garlic Toxicity — Risk of Anemia',
          items: [
            'Alliums (onion, garlic, leek, chive, shallot) damage red blood cells, causing Heinz-body anemia — cats are especially sensitive.',
            'Seek veterinary care promptly; severe cases need oxygen, IV fluids, and possibly a blood transfusion.',
            'Symptoms (lethargy, weakness, pale gums, reddish urine) may appear 1-3 days after ingestion.',
            'Both cooked and powdered forms are toxic — onion/garlic powder in baby food and seasonings is a common hidden source.',
            'Keep table scraps, especially soups, sauces, and seasoned meats, away from pets.'
          ]
        };
      },
      low: function() {
        return {
          title: '⚠️ Onion/Garlic Exposure — Monitor for Anemia',
          items: [
            'Allium toxicity is cumulative — repeated small amounts can be as dangerous as a single large dose.',
            'Contact your vet with the type, amount, and your pet\'s weight for a risk assessment.',
            'Watch for weakness, pale gums, rapid breathing, and dark/red urine over the next 2-3 days.',
            'A vet can run a blood test to check red-cell health even before symptoms show.',
            'Avoid feeding any human foods containing onion or garlic powder.'
          ]
        };
      }
    },
    xylitolToxicity: {
      high: function() {
        return {
          title: '🚨 Xylitol Poisoning — Critical Emergency',
          items: [
            'Xylitol causes a massive insulin release leading to sudden, severe hypoglycemia, and can cause acute liver failure — often fatal within hours.',
            'Get to an emergency vet IMMEDIATELY. Even tiny amounts of sugar-free gum, mints, or peanut butter can kill a dog.',
            'Treatment requires rapid IV dextrose, close blood-glucose monitoring, and liver-value testing for 24-72 hours.',
            'Symptoms (wobbliness, collapse, seizures) can appear within 15-30 minutes of ingestion.',
            'Check ALL labels — xylitol (and "birch sugar") is in gum, candy, toothpaste, and many "sugar-free" foods.'
          ]
        };
      },
      low: function() {
        return {
          title: '⚠️ Xylitol Exposure — Emergency Evaluation Urged',
          items: [
            'There is no safe threshold for xylitol in dogs — effects are dose-dependent but can be severe even at low amounts.',
            'Call your vet or poison control right away with the product and exact xylitol amount.',
            'Do not wait for symptoms; early IV dextrose dramatically improves survival.',
            'Bring the packaging so the vet can calculate the precise dose ingested.',
            'Never use xylitol-containing peanut butter or toothpaste products around pets.'
          ]
        };
      }
    },
    puppyWeight: {
      small: function(predictedLbs) {
        return {
          title: 'Small-Breed Puppy Growth — Handle with Care',
          items: [
            `Your pup is projected to reach about ${predictedLbs} at adulthood. Small breeds mature fast — often reaching full size by 9-12 months.`,
            'Feed a small-breed puppy formula with smaller kibble and higher calorie density to match their fast metabolism.',
            'Because they\'re prone to hypoglycemia, never skip meals — 3-4 small feedings daily are ideal for toy and small breeds.',
            'Protect growing joints: avoid high-impact jumping (off furniture, stairs) until growth plates close.',
            'Socialize early and often — small dogs benefit hugely from confident, positive early experiences.'
          ]
        };
      },
      medium: function(predictedLbs) {
        return {
          title: 'Medium-Breed Puppy Growth — Steady & Balanced',
          items: [
            `Expected adult weight is around ${predictedLbs}. Medium breeds typically finish growing between 12-15 months.`,
            'Feed a balanced puppy diet split into 3 meals daily, transitioning to 2 meals as they near maturity.',
            'Use the predicted adult weight (not current weight) to choose the right portion and Life-stage food.',
            'Build a foundation of training and exercise now — a well-conditioned medium dog stays fit for life.',
            'Re-weigh monthly; adjust food if your pup is gaining too fast (ribs should stay easily felt under a thin fat cover).'
          ]
        };
      },
      large: function(predictedLbs) {
        return {
          title: 'Large-Breed Puppy Growth — Protect Those Joints',
          items: [
            `Projected adult weight is about ${predictedLbs}. Large and giant breeds grow slowly, often not maturing until 18-24 months.`,
            'Feed a large-breed puppy formula with controlled calcium and calories — too-fast growth dramatically raises hip dysplasia risk.',
            'Keep exercise low-impact: avoid forced running, long hikes, and stairs until growth plates close (~18 months).',
            'Split food into 2-3 meals to lower the risk of gastric dilatation-volvulus (bloat), a life-threatening emergency in big dogs.',
            'Use a slow-feeder bowl and avoid exercise for an hour after eating to further reduce bloat risk.'
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
  const resultIds = ['ageResult', 'calorieResult', 'pregResult', 'toxResult', 'bmiResult', 'costResult', 'weightResult', 'insResult', 'lifeResult', 'breedCalResult', 'waterResult', 'travelResult', 'sittingResult', 'aquariumResult'];
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

// --- Evidence-Based Badge ---
// Renders an E-E-A-T trust badge on calculator pages.
// We do NOT claim veterinary authorship. Instead we are transparent that
// formulas are compiled from published veterinary sources and reviewed by
// our editorial team. This is honest, Google-safe, and still signals authority.
const VetBadge = {
  sources: 'AAHA · AAFCO · NRC · Merck Veterinary Manual',
  updatedDate: 'June 2026',

  render: function() {
    const targets = document.querySelectorAll('[data-vet-reviewed]');
    if (!targets.length) return;

    const badge = `
      <div class="vet-badge" itemscope itemtype="https://schema.org/Thing">
        <div class="vet-badge-icon" aria-hidden="true">📚</div>
        <div class="vet-badge-text">
          <span class="vet-badge-label">Evidence-Based Formulas</span>
          <span class="vet-badge-author" itemprop="name">Compiled from Veterinary Sources</span>
          <span class="vet-badge-creds">Sourced: ${this.sources} · Updated ${this.updatedDate}</span>
        </div>
      </div>`;

    targets.forEach(el => {
      el.insertAdjacentHTML('afterbegin', badge);
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  VetBadge.render();
});

// --- Social Share ---
// Generates a shareable result card and provides social sharing buttons.
const SocialShare = {
  generateCard: function(title, value, subtitle, color) {
    color = color || '#0D7C66';
    return `
      <div class="share-card-preview" style="background:linear-gradient(135deg, ${color}15, ${color}05); border-color:${color};">
        <div class="share-card-top">
          <span class="share-card-brand">🐾 PetCalcHub</span>
          <span class="share-card-tag">My Pet Result</span>
        </div>
        <div class="share-card-body">
          <div class="share-card-value" style="color:${color};">${value}</div>
          <div class="share-card-title">${title}</div>
          ${subtitle ? `<div class="share-card-subtitle">${subtitle}</div>` : ''}
        </div>
        <div class="share-card-footer">Calculated on PetCalcHub · petcalchub.com</div>
      </div>`;
  },

  render: function(containerId, shareData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { title, value, subtitle, color, url } = shareData;
    const shareUrl = encodeURIComponent(url || window.location.href);
    const shareText = encodeURIComponent(`${title}: ${value}${subtitle ? ' — ' + subtitle : ''} (via PetCalcHub)`);
    const shareTitle = encodeURIComponent(title);

    container.innerHTML = `
      <div class="share-section">
        <div class="share-section-title">📤 Share Your Result</div>
        ${this.generateCard(title, value, subtitle, color)}
        <div class="share-buttons">
          <a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Facebook</span>
          </a>
          <a class="share-btn share-tw" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener" aria-label="Share on Twitter/X">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>Twitter/X</span>
          </a>
          <a class="share-btn share-pin" href="https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareText}" target="_blank" rel="noopener" aria-label="Share on Pinterest">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535C18.604 24 24 18.613 24 11.992 24 5.367 18.633 0 12.017 0z"/></svg>
            <span>Pinterest</span>
          </a>
          <a class="share-btn share-reddit" href="https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}" target="_blank" rel="noopener" aria-label="Share on Reddit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.214-4.259-1.985-6.971-2.078l1.182-5.498 3.857.811-.005.179c0 1.459 1.192 2.645 2.657 2.645s2.657-1.186 2.657-2.645c0-1.459-1.192-2.645-2.657-2.645-.869 0-1.643.424-2.129 1.075l-4.345-.915c-.281-.057-.559.119-.621.395l-1.314 6.108c-2.753.069-5.242.846-7.077 2.069-.476-.457-1.121-.739-1.835-.739C1.192 9.134 0 10.32 0 11.779c0 1.058.627 1.973 1.532 2.403-.04.249-.061.501-.061.757 0 3.836 4.539 6.961 10.117 6.961s10.117-3.125 10.117-6.961c0-.256-.021-.508-.061-.757.905-.43 1.532-1.345 1.532-2.403zm-12.375 6.961c-5.042 0-9.117-2.835-9.117-6.343 0-.185.013-.37.038-.552.776.413 1.738.701 2.833.838-.394.524-.638 1.149-.638 1.823 0 1.748 1.812 3.172 4.041 3.172s4.041-1.424 4.041-3.172c0-.674-.244-1.299-.638-1.823 1.095-.137 2.057-.425 2.833-.838.025.182.038.367.038.552 0 3.508-4.075 6.343-9.117 6.343zm-2.078-4.234c0 1.073 1.005 1.945 2.243 1.945s2.243-.872 2.243-1.945c0-.726-.463-1.355-1.132-1.692-.359.055-.73.085-1.111.085s-.752-.03-1.111-.085c-.669.337-1.132.966-1.132 1.692zm-3.547-2.727c0-.894.731-1.625 1.625-1.625s1.625.731 1.625 1.625-.731 1.625-1.625 1.625-1.625-.731-1.625-1.625zm8.584 0c0-.894.731-1.625 1.625-1.625s1.625.731 1.625 1.625-.731 1.625-1.625 1.625-1.625-.731-1.625-1.625z"/></svg>
            <span>Reddit</span>
          </a>
          <button class="share-btn share-copy" onclick="SocialShare.copyLink('${url || window.location.href}')" aria-label="Copy link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            <span>Copy Link</span>
          </button>
        </div>
      </div>`;
  },

  copyLink: function(url) {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('.share-copy span');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      }
    }).catch(() => {});
  }
};

// --- Amazon Associates Product Recommendations ---
// IMPORTANT: We link to Amazon SEARCH results pages (never specific ASINs).
// Search links never 404 — specific product ASIN links go stale when products
// are delisted, which is the #1 cause of "page not found" errors. Search links
// also keep Amazon's page showing CURRENT price/availability (compliant with
// Amazon Associates Operating Agreement — we never cache or state prices).
const AmazonProducts = {
  affiliateId: 'calchive-20',

  buildLink: function(keyword) {
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword) + '&tag=' + this.affiliateId;
  },

  renderCard: function(p) {
    const query = p.searchQuery || p.name;
    return `
      <div class="amz-card">
        <div class="amz-card-icon" aria-hidden="true">${p.icon}</div>
        <div class="amz-card-body">
          <h4 class="amz-card-title">${p.name}</h4>
          <p class="amz-card-desc">${p.description}</p>
          <a class="amz-card-btn"
             href="${this.buildLink(query)}"
             target="_blank"
             rel="nofollow sponsored noopener">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18l-2 13H5L3 6zm0-2v-.5C3 2.67 4.67 1 6.5 1c.76 0 1.5.27 2.07.77L7.27 3.2c-.23-.13-.5-.2-.77-.2-.83 0-1.5.67-1.5 1.5V4H3z"/></svg>
            Check Price on Amazon
          </a>
        </div>
      </div>`;
  },

  disclosure: function() {
    return `<p class="amz-disclosure">
      <strong>Affiliate Disclosure:</strong> As an Amazon Associate, PetCalcHub earns from qualifying purchases.
      Links go to Amazon search results — actual prices shown on Amazon at time of viewing and may change.
    </p>`;
  },

  // Full section render (page-level)
  render: function(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = (config.products || []).map(p => this.renderCard(p)).join('');

    container.innerHTML = `
      <section class="amz-section">
        <div class="amz-header">
          <span class="amz-badge">🛒 Recommended on Amazon</span>
          <h2>${config.title}</h2>
          ${config.intro ? `<p class="amz-intro">${config.intro}</p>` : ''}
        </div>
        <div class="amz-grid">
          ${products}
        </div>
        ${this.disclosure()}
      </section>`;
  },

  // Mini widget — 2-3 products shown right after calculator results
  // High-conversion placement because user just computed results.
  renderMini: function(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = (config.products || []).slice(0, 3).map(p => this.renderCard(p)).join('');

    container.innerHTML = `
      <div class="amz-mini">
        <div class="amz-mini-header">
          <span class="amz-badge amz-badge-sm">🛒 Related Products on Amazon</span>
          <h3 class="amz-mini-title">${config.title || 'Featured Products'}</h3>
        </div>
        <div class="amz-mini-grid">
          ${products}
        </div>
        ${this.disclosure()}
      </div>`;
  },

  // Floating sidebar widget — always visible while scrolling
  renderFloating: function(config) {
    const existing = document.getElementById('amz-floating');
    if (existing) return;

    const products = (config.products || []).slice(0, 2);
    const productLinks = products.map(p => {
      const query = p.searchQuery || p.name;
      return `<a class="amz-float-item" href="${this.buildLink(query)}" target="_blank" rel="nofollow sponsored noopener">
        <span class="amz-float-icon">${p.icon}</span>
        <span class="amz-float-name">${p.name}</span>
        <span class="amz-float-arrow">→</span>
      </a>`;
    }).join('');

    const el = document.createElement('div');
    el.id = 'amz-floating';
    el.className = 'amz-floating';
    el.innerHTML = `
      <button class="amz-float-toggle" aria-label="Toggle Amazon recommendations" onclick="AmazonProducts.toggleFloating()">
        <span>🛒 Shop</span>
      </button>
      <div class="amz-float-panel">
        <div class="amz-float-header">
          <span class="amz-badge amz-badge-sm">Amazon Picks</span>
        </div>
        <div class="amz-float-items">
          ${productLinks}
        </div>
        ${this.disclosure()}
      </div>`;
    document.body.appendChild(el);
  },

  toggleFloating: function() {
    const el = document.getElementById('amz-floating');
    if (el) el.classList.toggle('amz-float-open');
  }
};
