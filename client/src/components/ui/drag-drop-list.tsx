import { useState, useRef, useEffect } from "react";

interface DragDropListProps<T> {
  items: T[];
  onReorder: (startIndex: number, endIndex: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export default function DragDropList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className = "",
}: DragDropListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
    
    // Add visual feedback
    setTimeout(() => {
      if (draggedElementRef.current) {
        draggedElementRef.current.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Reset visual feedback
    if (draggedElementRef.current) {
      draggedElementRef.current.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear dragOverIndex if we're actually leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        return (
          <div
            key={keyExtractor(item)}
            ref={isDragging ? draggedElementRef : null}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              transition-all duration-200 ease-in-out
              ${isDragging ? "scale-105 shadow-lg" : ""}
              ${isDragOver ? "transform translate-y-1 shadow-md" : ""}
              ${isDragOver && draggedIndex !== null && draggedIndex < index ? "border-t-2 border-tabster-orange" : ""}
              ${isDragOver && draggedIndex !== null && draggedIndex > index ? "border-b-2 border-tabster-orange" : ""}
            `}
            style={{
              opacity: isDragging ? 0.8 : 1,
            }}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
