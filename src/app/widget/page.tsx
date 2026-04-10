import { ChatWidget } from "@/features/chat/components/ChatWidget";

export default function WidgetPage() {
  return (
    <div
      id="widget-root"
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ChatWidget />
    </div>
  );
}
