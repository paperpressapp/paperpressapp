# Question Bank Integration Guide

## Overview
PaperPress supports importing questions from real textbooks. Questions are organized by:
- **Class** (9th, 10th, 11th, 12th)
- **Subject** (Physics, Chemistry, Biology, Mathematics, etc.)
- **Chapter** (Within each subject)

## File Structure
```
src/data/questions/
├── 9th/
│   ├── physics.json
│   ├── chemistry.json
│   ├── biology.json
│   └── mathematics.json
├── 10th/
│   ├── physics.json
│   ├── chemistry.json
│   └── ...
├── 11th/
└── 12th/
```

## JSON Structure
Each JSON file follows this structure:

```json
{
  "class": "10th",
  "subject": "Physics",
  "chapters": [
    {
      "id": "10_phy_ch1",
      "number": 1,
      "name": "Wave Motion",
      "mcqs": [...],
      "shorts": [...],
      "longs": [...]
    }
  ]
}
```

## Question Types

### MCQ Questions
```json
{
  "id": "10_phy_ch1_mcq_1",
  "questionText": "What is the distance between two consecutive crests of a wave called?",
  "options": ["Amplitude", "Wavelength", "Frequency", "Period"],
  "correctOption": 1,
  "difficulty": "easy",
  "marks": 1
}
```

### Short Questions
```json
{
  "id": "10_phy_ch1_short_1",
  "questionText": "Define wavelength and give its unit.",
  "modelAnswer": "Wavelength is the distance between two consecutive crests or troughs...",
  "keywords": ["distance", "crests", "troughs", "meter"],
  "difficulty": "easy",
  "marks": 3
}
```

### Long Questions
```json
{
  "id": "10_phy_ch1_long_1",
  "questionText": "Describe the relationship between wave velocity, frequency, and wavelength.",
  "modelAnswer": "The wave equation is v = f × λ where...",
  "steps": [
    "Define wave velocity",
    "Define frequency",
    "Define wavelength",
    "Derive the formula"
  ],
  "difficulty": "medium",
  "marks": 5
}
```

## Adding Questions from Real Books

### Step 1: Identify the Source
- Punjab Textbook Board (PTB)
- Federal Board
- Other regional boards

### Step 2: Map Chapters
Create a mapping between book chapters and PaperPress chapter IDs.

### Step 3: Convert Questions
Convert questions from the book format to PaperPress JSON format.

### Step 4: Import
Place the JSON file in the appropriate folder and rebuild.

## Supported Fields

### Required Fields
- `id` - Unique identifier
- `questionText` - The question text
- `difficulty` - easy | medium | hard
- `marks` - Mark value

### Optional Fields
- `options` - For MCQs (array of 4 strings)
- `correctOption` - Index of correct answer (0-3)
- `modelAnswer` - For short/long questions
- `keywords` - For grading short answers
- `explanation` - Explanation for MCQs

## Best Practices
1. **Quality over Quantity** - Focus on important questions
2. **Include Variety** - Mix of easy, medium, and hard
3. **Cover All Chapters** - Ensure good coverage
4. **Verify Answers** - Double-check all correct answers
5. **Add Explanations** - Helps students understand

## Import Tools
Run `npm run import-questions` to validate and import question files.
