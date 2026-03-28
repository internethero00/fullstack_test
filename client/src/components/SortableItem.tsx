import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
    id: number;
    onDeselect: (id: number) => void;
}

export function SortableItem({ id, onDeselect }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="item">
      <span className="drag-handle" {...attributes} {...listeners}>
        ≡
      </span>
            <span className="item-id">ID: {id}</span>
            <button onClick={() => onDeselect(id)} className="btn btn-deselect">
                −
            </button>
        </div>
    );
}