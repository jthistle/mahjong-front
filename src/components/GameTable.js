import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';

import Tile from './Tile';

const TILE = 'tile';

function GameTable(props) {
  const [{ isHovered }, drop] = useDrop({
    accept: TILE,
    collect: (monitor) => ({
      isHovered: props.allowDiscard && monitor.isOver(),
    }),
    drop: () => props.allowDiscard && props.discardCallback(),
  });

  const renderTiles = () => {
    const tiles = [];
    for (let i = 0; i < props.tiles.length; ++i) {
      tiles.push(<Tile {...props.tiles[i]} key={i} />);
    }
    return tiles;
  };

  return (
    <div ref={drop} className="mainTable">
      <div className="tiles">{renderTiles()}</div>
      <style jsx>{`
        .tiles {
          display: flex;
          flex-direction: row;
        }

        .mainTable {
          height: 20rem;
          border: 1px solid black;
          background: ${isHovered ? 'rgba(0, 0, 0, 0.3)' : 'none'};
        }
      `}</style>
    </div>
  );
}

GameTable.propTypes = {
  tiles: PropTypes.array,
  allowDiscard: PropTypes.bool,
  discardCallback: PropTypes.func,
};

export default GameTable;
