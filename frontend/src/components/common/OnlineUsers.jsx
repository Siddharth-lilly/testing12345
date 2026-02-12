// src/components/workspace/OnlineUsers.jsx
import React from 'react';
import { Users } from 'lucide-react';

const OnlineUsers = ({ users, count }) => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
      <Users className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-700">{count} online</span>
      
      <div className="flex -space-x-2 ml-4">
        {users.slice(0, 4).map((user, index) => (
          <div
            key={user.id}
            className={`
              w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-xs
              ${user.color}
            `}
            title={user.name}
          >
            {user.initials}
          </div>
        ))}
        {users.length > 4 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white font-semibold text-xs">
            +{users.length - 4}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;