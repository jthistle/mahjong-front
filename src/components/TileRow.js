import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import { c_TILE_RACK, n_BORDER_RADIUS } from '../theme';
import Tile from './Tile';

const TILE = 'tile';

function TileSpace(props) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: TILE,
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  return (
    <div>
      <style jsx>{`
        div {
          height: 3rem;
          width: 2rem;
          background: white;
        }
      `}</style>
    </div>
  );
}

const TileRow = (props) => {
  let i = 0;
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    setTiles(
      props.tiles.map((tile) => ({
        id: i++,
        ...tile,
      }))
    );
  }, [props]);

  const moveTile = useCallback(
    (dragIndex, hoverIndex) => {
      const dragTile = tiles[dragIndex];
      setTiles(
        update(tiles, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragTile],
          ],
        })
      );
    },
    [tiles]
  );

  const renderTile = (tile, index) => {
    return (
      <Tile
        key={tile.id}
        index={index}
        text={tile.text}
        moveTile={moveTile}
        {...tile}
      />
    );
  };

  return (
    <DndProvider backend={Backend}>
      <div className="container">
        {tiles.map((tile, i) => renderTile(tile, i))}
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: row;
          padding: 1rem;
          background: ${c_TILE_RACK};
          border-radius: ${n_BORDER_RADIUS};
          margin: auto;
        }
      `}</style>
    </DndProvider>
  );
};

export default TileRow;
