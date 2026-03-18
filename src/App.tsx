import { ChatContainer } from '@/components/ChatContainer';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {/* 移动端全屏布局 */}
      <div className="h-full w-full max-w-md mx-auto bg-white shadow-2xl">
        <ChatContainer className="h-full" />
      </div>
      
      {/* Toast通知 */}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
