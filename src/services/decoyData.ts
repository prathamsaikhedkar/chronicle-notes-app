import type { DecryptedNote, DecryptedTask } from '../types';

export const DECOY_NOTES: DecryptedNote[] = [
  {
    id: 'decoy-1',
    title: 'Weekend Grocery & Household Supplies',
    content: '- Sourdough bread & unsalted butter\n- Almond milk & Earl Grey tea\n- Fresh rosemary, garlic, and cherry tomatoes\n- Dishwasher pods & microfiber cloths\n- Pick up ground coffee beans from the roaster',
    tags: ['Shopping', 'Home'],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'decoy-2',
    title: 'Books & Documentaries to check out',
    content: '1. Thinking, Fast and Slow - Daniel Kahneman\n2. Atomic Habits (reread chapter 3 on friction)\n3. The Secret Lives of Trees\n4. BBC Planet Earth III episode on deserts',
    tags: ['Reading', 'Leisure'],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'decoy-3',
    title: 'Bicycle Spring Maintenance Checklist',
    content: '- Check tire air pressure (front: 45 psi, rear: 50 psi)\n- Degrease chain and apply dry ceramic lube\n- Inspect front brake pads for wear\n- Tighten bottle cage screws',
    tags: ['Fitness', 'Maintenance'],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'decoy-4',
    title: 'Classic Marinara Pasta Recipe',
    content: 'Ingredients: San Marzano peeled tomatoes, 4 crushed garlic cloves, fresh basil, extra virgin olive oil, sea salt, pinch of red pepper flakes.\nSimmer slowly for 25 minutes on low flame.',
    tags: ['Cooking'],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
  }
];

export const DECOY_TASKS: DecryptedTask[] = [
  {
    id: 'decoy-task-1',
    title: 'Weekly Routine & House Errands',
    items: [
      { id: 'dt-1', text: 'Water balcony ferns & succulents', completed: true },
      { id: 'dt-2', text: 'Schedule dentist routine checkup', completed: false },
      { id: 'dt-3', text: 'Clean air conditioner intake filter', completed: false },
      { id: 'dt-4', text: 'Drop off cardboard boxes at recycling depot', completed: true },
    ],
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'decoy-task-2',
    title: 'Quarterly Vehicle Inspection',
    items: [
      { id: 'dt-5', text: 'Rotate tires and verify tread depth', completed: false },
      { id: 'dt-6', text: 'Top off windshield washer fluid', completed: true },
      { id: 'dt-7', text: 'Check engine oil level', completed: true },
    ],
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    confidentiality: 'semi-confidential',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
  }
];
