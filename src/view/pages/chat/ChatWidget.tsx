import type {AiAssistantWidgetActionResponse, AiAssistantWidgetItemResponse, AiAssistantWidgetResponse} from "../../../api/types";

interface ChatWidgetProps {
    widget: AiAssistantWidgetResponse
    onAction: (action: AiAssistantWidgetActionResponse) => void
    onItemClick: (item: AiAssistantWidgetItemResponse) => void
}

export function ChatWidget({widget, onAction, onItemClick}: ChatWidgetProps) {
    const widgetType = widget.widgetType || "generic";
    const title = widget.title || "Подборка материалов";
    const items = Array.isArray(widget.items) ? widget.items : [];
    const actions = Array.isArray(widget.actions) ? widget.actions : [];
    const followUpOptions = Array.isArray(widget.followUpOptions) ? widget.followUpOptions : [];

    return (
        <div className={`chat-widget chat-widget-${widgetType}`}>
            <div className="chat-widget-header">
                <strong>{title}</strong>
                {widget.subtitle && <p>{widget.subtitle}</p>}
            </div>

            {items.length > 0 && (
                <div className="chat-widget-items">
                    {items.map((item) => (
                        <button className="chat-widget-item" key={item.id} onClick={() => onItemClick(item)} type="button">
                            <span className="chat-widget-item-title">{item.title}</span>
                            {item.subtitle && <span className="chat-widget-item-subtitle">{item.subtitle}</span>}
                            {item.meta && <span className="chat-widget-item-meta">{item.meta}</span>}
                        </button>
                    ))}
                </div>
            )}

            {actions.length > 0 && (
                <div className="chat-widget-actions">
                    {actions.map((action) => (
                        <button className="chat-widget-action" key={action.id} onClick={() => onAction(action)} type="button">
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {followUpOptions.length > 0 && (
                <div className="chat-widget-follow-up">
                    {followUpOptions.map((action) => (
                        <button className="chat-widget-follow-up-button" key={action.id} onClick={() => onAction(action)} type="button">
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
