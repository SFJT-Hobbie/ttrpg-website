import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import Sidebar from './components/Sidebar';
import DiceTray from './components/Dicetray';
import Home from './components/Home';
import Chapters from './components/Chapters.jsx';
import Subchapters from './components/Subchapters';
import RuleEditor from './components/RuleEditor';
import Characters from './components/Characters';
import CharacterSheet from './components/CharacterSheet.jsx';
import NPCSheet from './components/NPCSheet.jsx'; // Import the new NPCSheet
import EditCharacter from './components/EditCharacter.jsx'; // Import the new EditCharacter
import NonWeaponProficiencies from './components/NonWeaponProficiencies.jsx';
import Journal from './components/Journal';
import Inventory from './components/Inventory';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout';
import ProtectedRoute from './ProtectedRoute';
import './quill.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="main-content ml-16 mr-16 md:ml-64 md:mr-64">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rules" element={<Chapters />} />
              <Route path="/rules/:chapterId" element={<Subchapters />} />
              <Route path="/rules/new" element={<RuleEditor />} />
              <Route
                path="/characters"
                element={<ProtectedRoute><Characters /></ProtectedRoute>}
              />
              <Route
                path="/characters/:id"
                element={<ProtectedRoute><CharacterSheet /></ProtectedRoute>}
              />
              <Route
                path="/characters/new/pc"
                element={<ProtectedRoute><CharacterSheet /></ProtectedRoute>}
              />
              <Route
                path="/characters/new/npc"
                element={<ProtectedRoute><NPCSheet /></ProtectedRoute>}
              />
              <Route
                path="/characters/edit/:id"
                element={<ProtectedRoute><EditCharacter /></ProtectedRoute>}
              />
              <Route
                path="/characters/new/non-weapon-proficiencies"
                element={<ProtectedRoute><NonWeaponProficiencies /></ProtectedRoute>}
              />
              <Route
                path="/characters/new/inventory"
                element={<ProtectedRoute><Inventory /></ProtectedRoute>}
              />
              <Route
                path="/journals"
                element={<ProtectedRoute><Journal /></ProtectedRoute>}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/logout" element={<Logout />} />
            </Routes>
          </main>
        </div>
        <DiceTray />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;