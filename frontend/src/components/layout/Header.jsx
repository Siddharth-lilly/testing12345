// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, ChevronLeft, Settings, Bell, Share2, 
  Users, ChevronDown, X, Check, Copy, Link
} from 'lucide-react';

const OnlineCollaborators = ({ users }) => {
  const displayUsers = users.slice(0, 4);
  const extraCount = users.length - 4;
  
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600">{users.length} online</span>
      <div className="flex -space-x-2">
        {displayUsers.map((user, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold ${user.color}`}
            title={user.name}
          >
            {user.initials}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, projectName }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-slide-up">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Share Project</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500">Share this link with team members to collaborate on "{projectName}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ projectName, onSettingsClick }) => {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const onlineUsers = [
    { name: 'Siva', initials: 'S', color: 'bg-red-500' },
    { name: 'Priya', initials: 'P', color: 'bg-purple-500' },
    { name: 'Raj', initials: 'R', color: 'bg-blue-500' },
    { name: 'Maya', initials: 'M', color: 'bg-green-500' },
    { name: 'Amit', initials: 'A', color: 'bg-orange-500' },
  ];

  const notifications = [
    { id: 1, text: 'Priya approved the Design gate', time: '2h ago', unread: true },
    { id: 2, text: 'AI generated 3 new NFRs', time: '5h ago', unread: true },
    { id: 3, text: 'BRD v1.2 committed', time: '1d ago', unread: false },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Projects</span>
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E11932] rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">SDLC Studio</span>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-900 font-medium">{projectName || 'Loading...'}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Share */}
          <button 
            onClick={() => setShowShare(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>

          {/* Task Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">5 Tasks</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E11932] rounded-full border-2 border-white" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900">Notifications</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 hover:bg-gray-50 border-b border-gray-50 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                      <p className="text-sm text-gray-700">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-200" />

          {/* Online Collaborators */}
          <OnlineCollaborators users={onlineUsers} />

          <div className="h-5 w-px bg-gray-200" />

          {/* Settings */}
          <button 
            onClick={onSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>

          {/* User */}
          <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition">
            <div className="w-8 h-8 bg-[#E11932] rounded-full flex items-center justify-center text-white text-sm font-semibold">
              SS
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} projectName={projectName} />
    </header>
  );
};

export default Header;