import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import imageFromTile from '../imageFromTile';

const TILE = 'tile';

/**
 * Credit to react-dnd simple drag and drop example for the basis for this.
 * https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples-hooks/src/04-sortable/simple/index.tsx
 * MIT licensed.
 */

const DraggableTile = ({
  id,
  suit,
  value,
  index,
  moveTile,
  setHeld,
  selected,
  selectable,
  onSelectTile,
}) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: TILE,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      /* Don't drag onto itself */
      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      /* Get mouse position */
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (
        (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) ||
        (dragIndex > hoverIndex && hoverClientX > hoverMiddleX)
      ) {
        return;
      }

      moveTile(dragIndex, hoverIndex);

      /* unsafe, but ok in this case */
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: TILE, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => setHeld({ suit, value }),
    end: () => setHeld(null),
  });

  const getOpacity = () => {
    if (isDragging) {
      return 0;
    } else if (selectable) {
      if (selected) {
        return 1;
      } else {
        return 0.6;
      }
    }
  };

  drag(drop(ref));
  return (
    <div
      ref={ref}
      className="tile"
      onClick={() => onSelectTile({ suit, value, id })}
    >
      <img src={imageFromTile({ value, suit })} alt={suit + ' ' + value} />
      <style jsx>{`
        .tile {
          margin: 0.25rem;
          opacity: ${getOpacity()};
          height: 3.5rem;
          transition: 0.2s transform;
          transform: ${selected ? 'translate(0, -0.5rem)' : 'none'};
          cursor: pointer;
        }

        .tile:hover {
          transform: translate(0, ${selected ? -0.5 : -0.3}rem);
        }

        img {
          z-index: -1;
          height: 3.5rem;
        }
      `}</style>
    </div>
  );
};

export default DraggableTile;
