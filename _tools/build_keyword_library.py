#!/usr/bin/env python3
"""Build petcalchub long-tail keyword library (200+) for scheduled content updates.

Output: keyword_library.csv at repo root.
Each row maps a long-tail keyword to the site page it should internally link to,
plus 2-3 related pages, so the weekly content pipeline always has valid internal links.
"""
import csv, os, re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # parent of _tools -> repo root
OUT = os.path.join(REPO, "keyword_library.csv")

DOG_BREEDS = ["labrador retriever", "golden retriever", "french bulldog", "german shepherd",
              "bulldog", "poodle", "beagle", "yorkshire terrier", "chihuahua", "shih tzu",
              "dachshund", "boxer", "siberian husky", "pomeranian", "cavalier king charles spaniel",
              "cocker spaniel", "rottweiler", "great dane", "border collie", "australian shepherd"]
CAT_BREEDS = ["maine coon", "ragdoll", "persian", "siamese", "british shorthair",
              "bengal", "sphynx", "domestic shorthair", "norwegian forest", "scottish fold"]

# cluster -> (default_target_page, [related_pages...], default_intent, default_priority)
CMETA = {
    "chocolate":     ("calculators/chocolate-toxicity.html",
                      ["calculators/grape-toxicity.html", "calculators/xylitol-toxicity.html", "blog/chocolate-toxicity-guide.html"], "Informational", "High"),
    "dog_calorie":   ("calculators/dog-calorie.html",
                      ["calculators/dog-breed-calorie.html", "calculators/pet-bmi.html", "calculators/dog-water.html"], "Informational", "High"),
    "cat_calorie":   ("calculators/cat-calorie.html",
                      ["calculators/cat-water.html", "calculators/cat-life.html", "calculators/pet-bmi.html"], "Informational", "High"),
    "grape":         ("calculators/grape-toxicity.html",
                      ["calculators/chocolate-toxicity.html", "calculators/onion-toxicity.html"], "Informational", "High"),
    "xylitol":       ("calculators/xylitol-toxicity.html",
                      ["calculators/chocolate-toxicity.html", "calculators/grape-toxicity.html"], "Informational", "High"),
    "onion":         ("calculators/onion-toxicity.html",
                      ["calculators/grape-toxicity.html", "calculators/chocolate-toxicity.html"], "Informational", "High"),
    "ibuprofen":     ("calculators/ibuprofen-toxicity.html",
                      ["calculators/chocolate-toxicity.html", "calculators/onion-toxicity.html"], "Informational", "High"),
    "dog_age":       ("calculators/dog-age.html",
                      ["calculators/dog-life.html", "blog/dog-age-science.html", "calculators/pet-bmi.html"], "Informational", "High"),
    "cat_age":       ("calculators/cat-age.html",
                      ["calculators/cat-life.html", "blog/indoor-vs-outdoor-cats.html"], "Informational", "Medium"),
    "dog_life":      ("calculators/dog-life.html",
                      ["calculators/dog-age.html", "blog/dog-age-science.html"], "Informational", "High"),
    "cat_life":      ("calculators/cat-life.html",
                      ["calculators/cat-age.html", "blog/indoor-vs-outdoor-cats.html"], "Informational", "Medium"),
    "dog_pregnancy": ("calculators/dog-pregnancy.html",
                      ["calculators/puppy-weight.html", "calculators/dog-calorie.html"], "Informational", "Medium"),
    "cat_pregnancy": ("calculators/cat-pregnancy.html",
                      ["calculators/puppy-weight.html", "calculators/cat-calorie.html"], "Informational", "Medium"),
    "dog_water":     ("calculators/dog-water.html",
                      ["calculators/dog-calorie.html", "calculators/pet-bmi.html"], "Informational", "Medium"),
    "cat_water":     ("calculators/cat-water.html",
                      ["calculators/cat-calorie.html", "calculators/cat-life.html"], "Informational", "Medium"),
    "pet_bmi":       ("calculators/pet-bmi.html",
                      ["calculators/dog-calorie.html", "calculators/dog-water.html", "calculators/cat-calorie.html"], "Informational", "Medium"),
    "puppy":         ("calculators/puppy-weight.html",
                      ["calculators/dog-age.html", "calculators/dog-calorie.html", "calculators/dog-pregnancy.html"], "Informational", "Medium"),
    "pet_insurance": ("calculators/pet-insurance.html",
                      ["calculators/pet-sitting-rate.html", "blog/indoor-vs-outdoor-cats.html"], "Commercial", "High"),
    "pet_sitting":   ("calculators/pet-sitting-rate.html",
                      ["calculators/pet-travel-cost.html", "calculators/pet-insurance.html"], "Commercial", "Medium"),
    "pet_travel":    ("calculators/pet-travel-cost.html",
                      ["calculators/pet-sitting-rate.html", "calculators/pet-insurance.html"], "Commercial", "Medium"),
    "food_cost":     ("calculators/food-cost.html",
                      ["calculators/dog-calorie.html", "calculators/cat-calorie.html", "calculators/dog-breed-calorie.html"], "Commercial", "Medium"),
    "aquarium":      ("calculators/aquarium-calculator.html",
                      ["calculators/food-cost.html"], "Informational", "Low"),
    "breed_care":    ("calculators/dog-breed-calorie.html",
                      ["calculators/dog-life.html", "calculators/dog-calorie.html", "calculators/pet-bmi.html"], "Informational", "Medium"),
    "other_toxin":   ("calculators/chocolate-toxicity.html",
                      ["calculators/grape-toxicity.html", "calculators/xylitol-toxicity.html", "calculators/onion-toxicity.html"], "Informational", "High"),
    "general":       ("index.html",
                      ["calculators/dog-calorie.html", "calculators/chocolate-toxicity.html"], "Informational", "Low"),
}

rows = []
def add(kw, cluster, title=None, intent=None, target=None, related=None, priority=None, notes=""):
    t, rel, di, dp = CMETA[cluster]
    rows.append({
        "keyword": kw,
        "slug": re.sub(r"[^a-z0-9]+", "-", kw.lower()).strip("-"),
        "cluster": cluster,
        "search_intent": intent or di,
        "target_page": target or t,
        "related_pages": "|".join(related) if related else "|".join(rel),
        "suggested_title": title or kw.title(),
        "priority": priority or dp,
        "status": "pending",
        "published_date": "",
        "notes": notes,
    })

# ---- Chocolate (flagship) ----
choc_top = [
    ("chocolate toxicity calculator for dogs", "Chocolate Toxicity Calculator for Dogs: How to Know If Your Dog Is in Danger"),
    ("how much chocolate can a dog eat", "How Much Chocolate Can a Dog Eat Before It's Dangerous?"),
    ("signs of chocolate poisoning in dogs", "Signs of Chocolate Poisoning in Dogs: What to Watch For"),
    ("what to do if dog eats chocolate", "What to Do If Your Dog Eats Chocolate: A Step-by-Step Emergency Plan"),
    ("chocolate toxicity calculator by weight", "Chocolate Toxicity Calculator by Weight: Why Size Changes Everything"),
    ("is dark chocolate worse for dogs", "Is Dark Chocolate Worse for Dogs? Theobromine by Chocolate Type"),
    ("how long does chocolate stay in a dog's system", "How Long Does Chocolate Stay in a Dog's System?"),
    ("can a small amount of chocolate kill a dog", "Can a Small Amount of Chocolate Kill a Dog? Dose Thresholds Explained"),
    ("chocolate toxicity calculator mg/kg", "Chocolate Toxicity in mg/kg: The Number Vets Actually Use"),
    ("my dog ate a chocolate chip cookie", "My Dog Ate a Chocolate Chip Cookie: Should You Panic?"),
    ("dog ate brownie what to do", "Dog Ate a Brownie? Here's Exactly What to Do"),
    ("puppy ate chocolate danger", "Puppy Ate Chocolate: Why Small Dogs Are at Highest Risk"),
]
for kw, ti in choc_top:
    add(kw, "chocolate", ti)

# ---- Dog calorie ----
dog_cal_top = [
    ("dog calorie calculator by weight", "Dog Calorie Calculator by Weight: Find Your Dog's Daily Need"),
    ("how many calories should my dog eat per day", "How Many Calories Should My Dog Eat per Day?"),
    ("calories needed for a senior dog", "Calories Needed for a Senior Dog (and How They Differ)"),
    ("dog calorie calculator for weight loss", "Dog Calorie Calculator for Weight Loss: Safe Daily Targets"),
    ("how much to feed my dog to lose weight", "How Much to Feed My Dog to Lose Weight"),
    ("resting energy requirement dog calculator", "Resting Energy Requirement (RER) for Dogs: The Formula Behind the Calculator"),
    ("how to calculate dog food portions", "How to Calculate Dog Food Portions by Calorie"),
    ("dog feeding chart by weight and age", "Dog Feeding Chart by Weight and Age"),
    ("calorie needs for small breed dogs", "Calorie Needs for Small Breed Dogs"),
    ("calorie needs for large breed dogs", "Calorie Needs for Large Breed Dogs"),
    ("dog food calculator cups per day", "Dog Food Calculator: Cups per Day From Calories"),
    ("how many kcal should a dog eat a day", "How Many kcal Should a Dog Eat a Day?"),
]
for kw, ti in dog_cal_top:
    add(kw, "dog_calorie", ti)
for b in DOG_BREEDS:
    bt = b.title()
    add(f"{b} calorie calculator", "dog_calorie",
        f"{bt} Calorie Calculator: Daily Food Needs")
    add(f"how much to feed a {b}", "dog_calorie",
        f"How Much to Feed a {bt}: Portions by Weight and Age")

# ---- Cat calorie ----
cat_cal_top = [
    ("cat calorie calculator by weight", "Cat Calorie Calculator by Weight"),
    ("how many calories should my cat eat per day", "How Many Calories Should My Cat Eat per Day?"),
    ("calories needed for an indoor cat", "Calories Needed for an Indoor Cat vs Outdoor Cat"),
    ("cat feeding chart by weight", "Cat Feeding Chart by Weight"),
    ("how much to feed my cat to lose weight", "How Much to Feed My Cat to Lose Weight"),
    ("wet food vs dry food calories for cats", "Wet Food vs Dry Food Calories for Cats"),
]
for kw, ti in cat_cal_top:
    add(kw, "cat_calorie", ti)
for b in CAT_BREEDS:
    bt = b.title()
    add(f"{b} cat calorie calculator", "cat_calorie",
        f"{bt} Cat Calorie Calculator: Daily Needs")

# ---- Grape ----
grape_top = [
    ("grape toxicity calculator for dogs", "Grape Toxicity Calculator for Dogs: Why Raisins Are Risky"),
    ("how many grapes can kill a dog", "How Many Grapes Can Kill a Dog?"),
    ("are raisins toxic to dogs", "Are Raisins Toxic to Dogs? The Kidney-Failure Link"),
    ("my dog ate one grape what to do", "My Dog Ate One Grape: What to Do"),
    ("grape toxicity calculator by weight", "Grape Toxicity Calculator by Weight"),
    ("can cats eat grapes", "Can Cats Eat Grapes? Grape Toxicity in Cats"),
]
for kw, ti in grape_top:
    add(kw, "grape", ti)

# ---- Xylitol ----
xyl_top = [
    ("xylitol toxicity calculator for dogs", "Xylitol Toxicity Calculator for Dogs: Sugar-Free Danger"),
    ("how much xylitol is toxic to a dog", "How Much Xylitol Is Toxic to a Dog?"),
    ("xylitol in peanut butter for dogs", "Xylitol in Peanut Butter for Dogs: How to Check"),
    ("my dog ate sugar free gum", "My Dog Ate Sugar-Free Gum: Emergency Steps"),
    ("signs of xylitol poisoning in dogs", "Signs of Xylitol Poisoning in Dogs"),
    ("xylitol toxicity calculator by weight", "Xylitol Toxicity Calculator by Weight"),
]
for kw, ti in xyl_top:
    add(kw, "xylitol", ti)

# ---- Onion ----
onion_top = [
    ("onion toxicity calculator for dogs", "Onion Toxicity Calculator for Dogs: Alliums Explained"),
    ("can dogs eat onion powder", "Can Dogs Eat Onion Powder? Hidden Allium Risk"),
    ("how much onion is toxic to a dog", "How Much Onion Is Toxic to a Dog?"),
    ("are scallions toxic to dogs", "Are Scallions Toxic to Dogs?"),
    ("garlic toxicity in dogs calculator", "Garlic Toxicity in Dogs: Calculator and Thresholds"),
    ("my dog ate a small piece of onion", "My Dog Ate a Small Piece of Onion: What to Do"),
]
for kw, ti in onion_top:
    add(kw, "onion", ti)

# ---- Ibuprofen ----
ibu_top = [
    ("ibuprofen toxicity calculator for dogs", "Ibuprofen (Advil) Toxicity Calculator for Dogs"),
    ("can i give my dog ibuprofen for pain", "Can I Give My Dog Ibuprofen for Pain? (No — Here's Why)"),
    ("how much ibuprofen is toxic to a dog", "How Much Ibuprofen Is Toxic to a Dog?"),
    ("my dog ate one ibuprofen what to do", "My Dog Ate One Ibuprofen: Emergency Steps"),
    ("ibuprofen toxicity calculator by weight", "Ibuprofen Toxicity Calculator by Weight"),
    ("naproxen toxicity in dogs", "Naproxen Toxicity in Dogs: Same Danger, Different Pill"),
]
for kw, ti in ibu_top:
    add(kw, "ibuprofen", ti)

# ---- Dog age ----
dog_age_top = [
    ("dog age calculator in human years", "Dog Age Calculator in Human Years: The Real Math"),
    ("dog years to human years calculator", "Dog Years to Human Years Calculator"),
    ("how old is my dog in human years", "How Old Is My Dog in Human Years?"),
    ("dog age calculator by breed", "Dog Age Calculator by Breed"),
    ("senior dog age in human years", "Senior Dog Age in Human Years"),
]
for kw, ti in dog_age_top:
    add(kw, "dog_age", ti)
for b in DOG_BREEDS[:12]:
    bt = b.title()
    add(f"{b} age in human years", "dog_age",
        f"{bt} Age in Human Years: Breed-Specific Aging")

# ---- Cat age ----
cat_age_top = [
    ("cat age calculator in human years", "Cat Age Calculator in Human Years"),
    ("cat years to human years calculator", "Cat Years to Human Years Calculator"),
    ("how old is my cat in human years", "How Old Is My Cat in Human Years?"),
    ("senior cat age in human years", "Senior Cat Age in Human Years"),
]
for kw, ti in cat_age_top:
    add(kw, "cat_age", ti)
for b in CAT_BREEDS[:6]:
    bt = b.title()
    add(f"{b} cat age in human years", "cat_age",
        f"{bt} Cat Age in Human Years")

# ---- Dog life ----
dog_life_top = [
    ("dog life expectancy calculator", "Dog Life Expectancy Calculator: What to Expect"),
    ("average lifespan of a dog by breed", "Average Lifespan of a Dog by Breed"),
    ("how to help my dog live longer", "How to Help My Dog Live Longer: Evidence-Based Tips"),
    ("small vs large breed lifespan", "Small vs Large Breed Lifespan: Why Big Dogs Die Younger"),
]
for kw, ti in dog_life_top:
    add(kw, "dog_life", ti)
for b in DOG_BREEDS[:12]:
    bt = b.title()
    add(f"{b} life expectancy", "dog_life",
        f"{bt} Life Expectancy: What Owners Should Know")

# ---- Cat life ----
cat_life_top = [
    ("cat life expectancy calculator", "Cat Life Expectancy Calculator"),
    ("average lifespan of a cat", "Average Lifespan of a Cat (Indoor vs Outdoor)"),
    ("indoor cat life expectancy", "Indoor Cat Life Expectancy: The Numbers"),
]
for kw, ti in cat_life_top:
    add(kw, "cat_life", ti)
for b in CAT_BREEDS[:6]:
    bt = b.title()
    add(f"{b} life expectancy", "cat_life",
        f"{bt} Life Expectancy")

# ---- Dog pregnancy ----
dog_preg = [
    ("dog pregnancy calculator", "Dog Pregnancy Calculator: Due Date From Mating Date"),
    ("how long are dogs pregnant", "How Long Are Dogs Pregnant? (63 Days Explained)"),
    ("dog gestation period calculator", "Dog Gestation Period Calculator"),
    ("dog pregnancy timeline by week", "Dog Pregnancy Timeline by Week"),
    ("signs your dog is pregnant", "Signs Your Dog Is Pregnant"),
    ("how many puppies will my dog have", "How Many Puppies Will My Dog Have?"),
    ("dog pregnancy calculator by due date", "Dog Pregnancy Calculator by Due Date"),
    ("what to feed a pregnant dog", "What to Feed a Pregnant Dog: Calorie Needs"),
    ("dog labor signs and timeline", "Dog Labor Signs and Timeline"),
    ("prenatal care for pregnant dogs", "Prenatal Care for Pregnant Dogs"),
]
for kw, ti in dog_preg:
    add(kw, "dog_pregnancy", ti)

# ---- Cat pregnancy ----
cat_preg = [
    ("cat pregnancy calculator", "Cat Pregnancy Calculator: Queening Date From Mating"),
    ("how long are cats pregnant", "How Long Are Cats Pregnant? (65 Days)"),
    ("cat gestation period calculator", "Cat Gestation Period Calculator"),
    ("signs your cat is pregnant", "Signs Your Cat Is Pregnant"),
    ("how many kittens will my cat have", "How Many Kittens Will My Cat Have?"),
    ("cat pregnancy timeline by week", "Cat Pregnancy Timeline by Week"),
    ("what to feed a pregnant cat", "What to Feed a Pregnant Cat"),
    ("cat labor signs and timeline", "Cat Labor Signs and Timeline"),
]
for kw, ti in cat_preg:
    add(kw, "cat_pregnancy", ti)

# ---- Dog / Cat water ----
water = [
    ("dog water intake calculator", "Dog Water Intake Calculator: How Much Water Per Day"),
    ("how much water should a dog drink per day", "How Much Water Should a Dog Drink per Day?"),
    ("dog drinking too much water causes", "Dog Drinking Too Much Water: Possible Causes"),
    ("how to get my dog to drink more water", "How to Get My Dog to Drink More Water"),
    ("cat water intake calculator", "Cat Water Intake Calculator"),
    ("how much water should a cat drink per day", "How Much Water Should a Cat Drink per Day?"),
    ("cat not drinking water how to help", "Cat Not Drinking Water: How to Help"),
    ("wet food and cat hydration", "Wet Food and Cat Hydration: The Calculator Connection"),
    ("dog water needs in summer", "Dog Water Needs in Summer: Staying Hydrated"),
    ("dehydration in dogs signs", "Dehydration in Dogs: Signs and Prevention"),
]
for kw, ti in water:
    cl = "dog_water" if "dog" in kw or "Dog" in kw else "cat_water"
    add(kw, cl, ti)

# ---- Pet BMI ----
bmi = [
    ("pet bmi calculator", "Pet BMI Calculator: Is Your Pet at a Healthy Weight?"),
    ("how to tell if my dog is overweight", "How to Tell If My Dog Is Overweight (BCS at Home)"),
    ("ideal weight for my dog calculator", "Ideal Weight for My Dog: Calculator and Chart"),
    ("dog body condition score chart", "Dog Body Condition Score Chart: Score Your Dog at Home"),
    ("cat body condition score chart", "Cat Body Condition Score Chart"),
    ("how to help my cat lose weight", "How to Help My Cat Lose Weight Safely"),
    ("is my dog obese", "Is My Dog Obese? BMI, BCS, and Next Steps"),
    ("safe weight loss for pets", "Safe Weight Loss for Pets: Why Crash Diets Fail"),
    ("dog weight loss calculator", "Dog Weight Loss Calculator: Daily Calorie Target"),
    ("cat weight loss calculator", "Cat Weight Loss Calculator"),
]
for kw, ti in bmi:
    cl = "pet_bmi"
    add(kw, cl, ti)

# ---- Puppy ----
pup = [
    ("puppy weight predictor", "Puppy Weight Predictor: How Big Will My Puppy Get?"),
    ("puppy weight calculator by age", "Puppy Weight Calculator by Age"),
    ("how big will my puppy get calculator", "How Big Will My Puppy Get? Calculator by Breed"),
    ("puppy growth chart by breed", "Puppy Growth Chart by Breed"),
    ("puppy weight gain per week", "Puppy Weight Gain per Week: Normal Ranges"),
    ("when do puppies stop growing", "When Do Puppies Stop Growing? Breed-by-Breed"),
    ("puppy feeding chart by weight", "Puppy Feeding Chart by Weight and Age"),
    ("how much to feed a puppy calculator", "How Much to Feed a Puppy: Calorie Calculator"),
    ("small breed puppy growth chart", "Small Breed Puppy Growth Chart"),
    ("large breed puppy growth chart", "Large Breed Puppy Growth Chart"),
]
for kw, ti in pup:
    add(kw, "puppy", ti)

# ---- Pet insurance ----
ins = [
    ("pet insurance cost calculator", "Pet Insurance Cost Calculator: What You'll Pay"),
    ("how much is pet insurance per month", "How Much Is Pet Insurance per Month?"),
    ("best pet insurance for dogs by breed", "Best Pet Insurance for Dogs by Breed"),
    ("is pet insurance worth it", "Is Pet Insurance Worth It? A Calculator-Based View"),
    ("pet insurance for older dogs", "Pet Insurance for Older Dogs: Costs and Coverage"),
    ("cat insurance cost calculator", "Cat Insurance Cost Calculator"),
    ("pet insurance deductible explained", "Pet Insurance Deductible Explained"),
    ("accident vs illness pet insurance", "Accident vs Illness Pet Insurance"),
    ("pet insurance for puppies", "Pet Insurance for Puppies: When to Enroll"),
    ("what does pet insurance not cover", "What Does Pet Insurance Not Cover?"),
]
for kw, ti in ins:
    add(kw, "pet_insurance", ti)
for b in DOG_BREEDS[:6]:
    bt = b.title()
    add(f"{b} pet insurance cost", "pet_insurance",
        f"{bt} Pet Insurance Cost: What to Expect")

# ---- Pet sitting ----
sit = [
    ("pet sitting rate calculator", "Pet Sitting Rate Calculator: What to Charge or Pay"),
    ("how much to charge for dog sitting", "How Much to Charge for Dog Sitting per Day"),
    ("average pet sitting rates 2026", "Average Pet Sitting Rates in 2026"),
    ("overnight pet sitting rate", "Overnight Pet Sitting Rate: What's Fair"),
    ("dog walking and pet sitting rates", "Dog Walking and Pet Sitting Rates"),
    ("how much to pay a house sitter for pets", "How Much to Pay a House Sitter for Pets"),
    ("pet sitting rates by city", "Pet Sitting Rates by City"),
    ("holiday pet sitting surcharge", "Holiday Pet Sitting Surcharge: What to Expect"),
]
for kw, ti in sit:
    add(kw, "pet_sitting", ti)

# ---- Pet travel ----
trav = [
    ("pet travel cost calculator", "Pet Travel Cost Calculator: Flying and Driving With Pets"),
    ("how much does it cost to fly with a dog", "How Much Does It Cost to Fly With a Dog?"),
    ("pet travel crate size calculator", "Pet Travel Crate Size Calculator"),
    ("flying with a cat what you need", "Flying With a Cat: What You Need"),
    ("road trip with a dog costs", "Road Trip With a Dog: Estimating the Costs"),
    ("pet passport and travel requirements", "Pet Passport and Travel Requirements"),
    ("how to travel with an anxious dog", "How to Travel With an Anxious Dog"),
    ("international pet travel cost", "International Pet Travel Cost: A Breakdown"),
]
for kw, ti in trav:
    add(kw, "pet_travel", ti)

# ---- Food cost ----
fc = [
    ("pet food cost calculator", "Pet Food Cost Calculator: Monthly and Yearly Spend"),
    ("how much does dog food cost per month", "How Much Does Dog Food Cost per Month?"),
    ("how much does cat food cost per month", "How Much Does Cat Food Cost per Month?"),
    ("raw vs kibble cost calculator", "Raw vs Kibble Cost Calculator for Dogs"),
    ("best value dog food by calorie", "Best Value Dog Food by Calorie (Not by Bag)"),
    ("how to budget for pet food", "How to Budget for Pet Food"),
    ("cost of feeding a large breed dog", "Cost of Feeding a Large Breed Dog"),
    ("cost of feeding a cat per year", "Cost of Feeding a Cat per Year"),
]
for kw, ti in fc:
    add(kw, "food_cost", ti)

# ---- Aquarium ----
aq = [
    ("aquarium calculator tank size", "Aquarium Calculator: What Tank Size Do You Need?"),
    ("how many fish per gallon calculator", "How Many Fish per Gallon: The Calculator Rule"),
    ("aquarium gallon to liter converter", "Aquarium Gallon to Liter Converter"),
    ("tank stocking calculator", "Tank Stocking Calculator: Avoid Overcrowding"),
    ("aquarium substrate calculator", "Aquarium Substrate Calculator: How Much Gravel"),
    ("heater size calculator for aquarium", "Heater Size Calculator for Your Aquarium"),
    ("aquarium filter flow rate calculator", "Aquarium Filter Flow Rate Calculator"),
    ("cycling a new aquarium guide", "Cycling a New Aquarium: Step-by-Step"),
    ("how many neon tetras per gallon", "How Many Neon Tetras per Gallon?"),
    ("plankton to fish tank math", "Planted Tank Substrate Calculator"),
]
for kw, ti in aq:
    add(kw, "aquarium", ti)

# ---- Breed care (deep dives) ----
breed_care = [
    ("dog breed calorie needs comparison", "Dog Breed Calorie Needs: A Comparison"),
    ("full grown weight by dog breed", "Full-Grown Weight by Dog Breed: Calculator-Backed"),
    ("best dog food for large breeds", "Best Dog Food for Large Breeds (Calorie-Smart)"),
    ("best dog food for small breeds", "Best Dog Food for Small Breeds"),
    ("dog breed exercise needs calculator", "Dog Breed Exercise Needs: Calculator and Guide"),
    ("hypoallergenic dog breeds list", "Hypoallergenic Dog Breeds: What the Term Really Means"),
    ("best family dog breeds", "Best Family Dog Breeds: Temperament and Care"),
    ("calm dog breeds for apartments", "Calm Dog Breeds for Apartments"),
    ("high energy dog breeds exercise", "High-Energy Dog Breeds and Their Exercise Needs"),
    ("dog breed lifespan comparison", "Dog Breed Lifespan Comparison"),
]
for kw, ti in breed_care:
    add(kw, "breed_care", ti)

# ---- Other toxins ----
others = [
    ("macadamia nuts toxic to dogs", "Are Macadamia Nuts Toxic to Dogs?", "calculators/chocolate-toxicity.html"),
    ("alcohol poisoning in dogs", "Alcohol Poisoning in Dogs: What to Do", "calculators/chocolate-toxicity.html"),
    ("caffeine toxicity in dogs", "Caffeine Toxicity in Dogs: Coffee, Tea, and Energy Drinks", "calculators/chocolate-toxicity.html"),
    ("avocado toxicity in dogs and cats", "Is Avocado Toxic to Pets?", "calculators/onion-toxicity.html"),
    ("garlic powder danger for dogs", "Garlic Powder Danger for Dogs", "calculators/onion-toxicity.html"),
    ("raw bread dough danger dogs", "Why Raw Bread Dough Is Dangerous for Dogs", "calculators/chocolate-toxicity.html"),
    ("cherries toxic to dogs", "Are Cherries Toxic to Dogs?", "calculators/grape-toxicity.html"),
    ("peach pits toxic to dogs", "Are Peach Pits Toxic to Dogs?", "calculators/grape-toxicity.html"),
    ("rhubarb toxicity in dogs", "Is Rhubarb Toxic to Dogs?", "calculators/onion-toxicity.html"),
    ("hops toxicity in dogs", "Hops Toxicity in Dogs: Home-Brew Hazard", "calculators/chocolate-toxicity.html"),
    ("marijuana toxicity in dogs", "Marijuana Toxicity in Dogs", "calculators/chocolate-toxicity.html"),
    ("yeast dough bloat dogs", "Yeast Dough and Bloat in Dogs", "calculators/chocolate-toxicity.html"),
]
for kw, ti, tgt in others:
    add(kw, "other_toxin", ti, target=tgt)

# ---- General / cross-topic ----
gen = [
    ("is peanut butter safe for dogs", "Is Peanut Butter Safe for Dogs? (Check for Xylitol)", "calculators/xylitol-toxicity.html"),
    ("human foods toxic to dogs list", "Human Foods Toxic to Dogs: The Full List", "calculators/chocolate-toxicity.html"),
    ("how long can a dog go without water", "How Long Can a Dog Go Without Water?", "calculators/dog-water.html"),
    ("how long can a cat go without water", "How Long Can a Cat Go Without Water?", "calculators/cat-water.html"),
    ("best way to brush a dog's teeth", "Best Way to Brush a Dog's Teeth", "calculators/pet-insurance.html"),
    ("how to introduce a new dog to a cat", "How to Introduce a New Dog to a Cat", "calculators/cat-life.html"),
    ("dog zoomies explained", "Dog Zoomies Explained", "calculators/dog-age.html"),
    ("why does my cat knead", "Why Does My Cat Knead? (And Other Quirks)", "calculators/cat-age.html"),
    ("pet proofing your home checklist", "Pet-Proofing Your Home: A Checklist", "index.html"),
    ("how to choose a vet", "How to Choose a Vet for Your Pet", "calculators/pet-insurance.html"),
]
for kw, ti, tgt in gen:
    add(kw, "general", ti, target=tgt)

# ---- de-duplicate by keyword (keep first) ----
seen = set()
final = []
for r in rows:
    if r["keyword"] in seen:
        continue
    seen.add(r["keyword"])
    final.append(r)

# ---- write CSV ----
cols = ["keyword", "slug", "cluster", "search_intent", "target_page", "related_pages",
        "suggested_title", "priority", "status", "published_date", "notes"]
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows(final)

# ---- validate referenced pages exist ----
missing = set()
for r in final:
    for p in [r["target_page"]] + r["related_pages"].split("|"):
        if p and not os.path.exists(os.path.join(REPO, p)):
            missing.add(p)
print(f"rows written: {len(final)}")
print(f"clusters: {len(set(r['cluster'] for r in final))}")
print(f"missing referenced pages: {sorted(missing) if missing else 'NONE'}")
