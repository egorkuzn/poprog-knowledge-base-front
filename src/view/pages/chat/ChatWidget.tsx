import type {AiAssistantWidgetActionResponse, AiAssistantWidgetItemResponse, AiAssistantWidgetResponse} from "../../../api/types";

interface ChatWidgetProps {
    widget: AiAssistantWidgetResponse
    onAction: (action: AiAssistantWidgetActionResponse) => void
    onItemClick: (item: AiAssistantWidgetItemResponse) => void
}

export function ChatWidget({widget, onAction, onItemClick}: ChatWidgetProps) {
    return (
        <div className={`chat-widget chat-widget-${widget.widgetType}`}>
            <div className="chat-widget-header">
                <strong>{widget.title}</strong>
                {widget.subtitle && <p>{widget.subtitle}</p>}
            </div>

            {widget.items.length > 0 && (
                <div className="chat-widget-items">
                    {widget.items.map((item) => (
                        <button className="chat-widget-item" key={item.id} onClick={() => onItemClick(item)} type="button">
                            <span className="chat-widget-item-title">{item.title}</span>
                            {item.subtitle && <span className="chat-widget-item-subtitle">{item.subtitle}</span>}
                            {item.meta && <span className="chat-widget-item-meta">{item.meta}</span>}
                        </button>
                    ))}
                </div>
            )}

            {widget.actions.length > 0 && (
                <div className="chat-widget-actions">
                    {widget.actions.map((action) => (
                        <button className="chat-widget-action" key={action.id} onClick={() => onAction(action)} type="button">
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {widget.followUpOptions.length > 0 && (
                <div className="chat-widget-follow-up">
                    {widget.followUpOptions.map((action) => (
                        <button className="chat-widget-follow-up-button" key={action.id} onClick={() => onAction(action)} type="button">
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
