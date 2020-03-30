import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import blankTile from './blankTile.svg';

const TILE = 'tile';

/**
 * Credit to react-dnd simple drag and drop example for the basis for this.
 * https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples-hooks/src/04-sortable/simple/index.tsx
 * MIT licensed.
 */

const Tile = ({ id, suit, value, index, moveTile }) => {
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
  });

  drag(drop(ref));
  return (
    <div ref={ref} className="tile">
      <img src={blankTile} alt="Blank tile" />
      <div className="text">
        {value} <br />
        {suit.slice(0, 2)}
      </div>
      <style jsx>{`
        .tile {
          margin: 0 0.25rem;
          opacity: ${isDragging ? 0 : 1};
          height: 3rem;
          transition: 0.2s transform;
        }

        .tile:hover {
          transform: translate(0, -0.3rem);
        }

        img {
          z-index: -1;
          height: 3rem;
        }

        .text {
          position: relative;
          top: -3rem;
          left: 0;
          color: black;
        }
      `}</style>
    </div>
  );
};

export default Tile;
