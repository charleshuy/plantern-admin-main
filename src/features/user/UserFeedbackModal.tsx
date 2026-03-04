import { useState } from "react";
import { X, Check } from "lucide-react";

interface Feedback {
  id: number;
  date: string;
  message: string;
  resolved: boolean;
}

interface User {
  id: number;
  username: string;
  image: string;
  feedbacks: Feedback[];
}

interface UserFeedbackModalProps {
  user: User;
  onClose: () => void;
}

export default function UserFeedbackModal({ user, onClose }: UserFeedbackModalProps) {
  const [replyingTo, setReplyingTo] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleFeedbackClick = (feedback: Feedback) => {
    if (!feedback.resolved) {
      setReplyingTo(feedback);
      setReplyText(`Hello ${user.username.split(" ")[0]},\n`);
    }
  };

  const handleSave = () => {
    // TODO: call API to save reply
    setReplyingTo(null);
    setReplyText("");
  };

  const handleCancel = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8 relative">
        {/* Close button */}
        <button
          onClick={replyingTo ? handleCancel : onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Support</h2>

        {replyingTo ? (
          /* Reply view */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={user.image} className="w-10 h-10 rounded-full object-cover" />
            </div>
            <p className="text-sm text-gray-800 font-medium mb-4">
              RE: {replyingTo.message}
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleCancel}
                className="px-8 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2 bg-black text-[#BDFF66] rounded-full text-sm font-semibold hover:bg-gray-800 transition"
              >
                SAVE
              </button>
            </div>
          </div>
        ) : (
          /* Feedback list view */
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2">
              <img src={user.image} className="w-16 h-16 rounded-xl object-cover" />
              <span className="text-sm font-medium text-center">{user.username}</span>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {user.feedbacks.map((fb) => (
                <div key={fb.id}>
                  <p className="text-xs text-gray-400 mb-1">{fb.date}</p>
                  <div
                    onClick={() => handleFeedbackClick(fb)}
                    className={`relative bg-gray-100 rounded-xl p-4 text-sm text-gray-700 ${
                      !fb.resolved ? "cursor-pointer hover:bg-gray-200 transition" : ""
                    }`}
                  >
                    {fb.message}
                    <span className="absolute bottom-3 right-3">
                      {fb.resolved ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <X size={16} className="text-red-500" />
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}