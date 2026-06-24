const lucide = require('lucide-react');
const icons = ['Pencil', 'Eraser', 'Trash2', 'Download', 'Undo', 'Redo', 'Square', 'Circle', 'Type', 'Hand', 'MousePointer2', 'FileText', 'Image', 'Triangle', 'Minus', 'ArrowRight', 'Settings', 'X', 'BookOpen', 'PenTool', 'Highlighter', 'Palette', 'ZoomIn', 'ZoomOut', 'Maximize'];
let missing = [];
for (const icon of icons) {
  if (!lucide[icon]) missing.push(icon);
}
console.log("Missing icons:", missing);
