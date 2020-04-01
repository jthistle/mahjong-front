import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import { c_TILE_RACK, n_BORDER_RADIUS } from '../theme';
import Tile from './DraggableTile';

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
    const toRemove = [];
    const toAdd = [];

    /* Gah! Nested for-loops?!? Don't worry, it should be ok... */
    props.tiles.forEach((incomingTile) => {
      const res = tiles.some((currentTile) => {
        if (incomingTile.id === currentTile.id) {
          return true;
        }
      });
      if (!res) {
        toAdd.push({
          ...incomingTile,
        });
      }
    });

    tiles.forEach((currentTile, i) => {
      const res = props.tiles.some((incomingTile) => {
        if (currentTile.id === incomingTile.id) {
          return true;
        }
      });
      if (!res) {
        toRemove.push(i);
      }
    });

    /* Sort removal array desc. */
    toRemove.sort((a, b) => b - a);

    setTiles(
      update(tiles, {
        $splice: toRemove.map((index) => [index, 1]),
        $push: toAdd,
      })
    );
  }, [props.tiles]);

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
        setHeld={props.setHeld}
        {...tile}
      />
    );
  };

  return (
    <>
      <div className="container">
        {tiles.map((tile, i) => renderTile(tile, i))}
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          padding: 1rem;
          background: ${c_TILE_RACK};
          border-radius: ${n_BORDER_RADIUS};
          margin: auto;
        }
      `}</style>
    </>
  );
};

TileRow.propTypes = {
  tiles: PropTypes.array,
  setHeld: PropTypes.func,
};

export default TileRow;
