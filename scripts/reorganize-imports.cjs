const fs = require('fs');
const path = require('path');

const replacements = [
  // Buttons
  { pattern: /@\/utils\/Buttons\/Button/g, replacement: '@/components/buttons/Button' },
  { pattern: /\.\.\/\.\.\/\.\.\/\.\.\/utils\/Buttons\/HoverButton/g, replacement: '@/components/buttons/HoverButton' },
  { pattern: /@\/utils\/Buttons\/HoverButton/g, replacement: '@/components/buttons/HoverButton' },
  { pattern: /@\/utils\/Buttons\/ModernButton/g, replacement: '@/components/buttons/ModernButton' },

  // Cards
  { pattern: /@\/utils\/Card\/BlogCard2/g, replacement: '@/components/cards/BlogCard2' },
  { pattern: /@\/utils\/Card\/BlogCard/g, replacement: '@/components/cards/BlogCard' },
  { pattern: /@\/utils\/Card\/CommunityCard/g, replacement: '@/components/cards/CommunityCard' },
  { pattern: /@\/utils\/Card\/HoverCard/g, replacement: '@/components/cards/HoverCard' },
  { pattern: /@\/utils\/Card\/MemberCardDashboard/g, replacement: '@/components/cards/MemberCardDashboard' },
  { pattern: /@\/utils\/Card\/MemberCard/g, replacement: '@/components/cards/MemberCard' },
  { pattern: /@\/utils\/Card\/ModernStatCard/g, replacement: '@/components/cards/ModernStatCard' },
  { pattern: /@\/utils\/Card\/ReviewCard/g, replacement: '@/components/cards/ReviewCard' },
  { pattern: /@\/utils\/Card\/ShapedCard/g, replacement: '@/components/cards/ShapedCard' },
  { pattern: /@\/utils\/Card\/SpotLightCard/g, replacement: '@/components/cards/SpotLightCard' },
  { pattern: /@\/utils\/Card\/TitledCard/g, replacement: '@/components/cards/TitledCard' },
  { pattern: /@\/utils\/Card\/TrainerCardDashboard/g, replacement: '@/components/cards/TrainerCardDashboard' },
  { pattern: /@\/utils\/Card\/WeirdCard/g, replacement: '@/components/cards/WeirdCard' },
  { pattern: /\.\.\/\.\.\/\.\.\/utils\/Card\/communitycard\.css/g, replacement: '@/components/cards/communitycard.css' },
  { pattern: /@\/utils\/Card\/communitycard\.css/g, replacement: '@/components/cards/communitycard.css' },
  { pattern: /@\/utils\/Card\/weirdcard\.css/g, replacement: '@/components/cards/weirdcard.css' },

  // Modals
  { pattern: /@\/utils\/Modal\/ConfirmationModal/g, replacement: '@/components/modals/ConfirmationModal' },
  { pattern: /@\/utils\/Modal\/ProfileModal/g, replacement: '@/components/modals/ProfileModal' },
  { pattern: /@\/utils\/Modal\/Community/g, replacement: '@/components/modals/CommunityModal' },

  // Tables
  { pattern: /@\/utils\/Table\/ModernTable/g, replacement: '@/components/tables/ModernTable' },

  // Headers
  { pattern: /@\/utils\/Header\/ModernHeader/g, replacement: '@/components/headers/ModernHeader' },
  { pattern: /@\/utils\/Header\/WorkspaceHeader/g, replacement: '@/components/headers/WorkspaceHeader' },
  { pattern: /@\/utils\/Header(?=['";\s])/g, replacement: '@/components/headers/CelebrationHeader' },

  // Navigation
  { pattern: /@\/utils\/NavBar\/Navbar/g, replacement: '@/components/navigation/Navbar' },
  { pattern: /@\/utils\/Footer\/Footer/g, replacement: '@/components/navigation/Footer' },
  { pattern: /@\/utils\/Sidebar\/index/g, replacement: '@/components/navigation/SuccessStoriesSidebar' },
  { pattern: /@\/utils\/Sidebar(?=['";\s])/g, replacement: '@/components/navigation/SuccessStoriesSidebar' },

  // Loaders
  { pattern: /@\/utils\/Loader\/CustomLoader/g, replacement: '@/components/common/loaders/CustomLoader' },
  { pattern: /@\/utils\/Loader(?=['";\s])/g, replacement: '@/components/common/loaders/RouteLoader' },

  // Timeline
  { pattern: /@\/utils\/Timeline\/Timeline/g, replacement: '@/components/timeline/Timeline' },

  // Container / Layout
  { pattern: /@\/utils\/Container\/ContainerFull/g, replacement: '@/components/layout/ContainerFull' },
  { pattern: /@\/utils\/Container\/Container/g, replacement: '@/components/layout/Container' },

  // UI / Animations
  { pattern: /\.\/utils\/clickSpark\/ClickSpark/g, replacement: '@/components/ui/ClickSpark' },
  { pattern: /@\/utils\/clickSpark\/ClickSpark/g, replacement: '@/components/ui/ClickSpark' },
  { pattern: /@\/utils\/Orbit\/Orbit/g, replacement: '@/components/ui/Orbit' },

  // Services
  { pattern: /@\/utils\/adminTrainer/g, replacement: '@/services/adminTrainer' },

  // Project List callers
  { pattern: /@\/utils\/project\/ProjectList/g, replacement: '@/components/project/ProjectList' },

  // Redux userSlice facade
  { pattern: /@\/redux\/userSlice/g, replacement: '@/redux/slices/userSlice' }
];

function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk('src');
let totalReplaced = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      console.log(`Replaced in ${f}: ${pattern} -> ${replacement}`);
      totalReplaced++;
    }
  }

  if (modified) {
    fs.writeFileSync(f, content, 'utf8');
  }
}

console.log(`Done! Total replacements made: ${totalReplaced}`);
