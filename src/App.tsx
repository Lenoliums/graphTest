import { useState, useEffect } from "react";
import "./App.css";
import { Graph } from "./Graph";

// const tryNodes : Array<Node>=[
//     { id:3,
//         name:'y2',
//     },
//     { id:0,
//         name:'x1',
//     },
//     { id:4,
//         name:'y3',
//     },
//     { id:7,
//         name:'z3',
//     },
//     { id:8,
//         name:'w1',
//     },
//     { id:5,
//         name:'z1',
//     },
//     { id:6,
//         name:'z2',
//     },
//     { id:1,
//         name:'x2',
//     },
//     { id:2,
//         name:'y1',
//     }
// ]
// const tryEdges : Array<Edge>=[
//     {fromId: 0,
//         toId: 2,
//     },
//     {fromId: 1,
//         toId: 2,
//     },
//     {fromId: 3,
//         toId: 6,
//     },
//     {fromId: 4,
//         toId: 6,
//     },
//     {fromId: 1,
//         toId: 3,
//     },
//     {fromId: 1,
//         toId: 4,
//     },
//     {fromId: 2,
//         toId: 5,
//     },
//     {fromId: 2,
//         toId: 6,
//     },
//     {fromId: 4,
//         toId: 7,
//     },
//     {fromId: 7,
//         toId: 8,
//     },

// ]

// const tryNodes : Array<Node>=[
//     { id:0,
//         name:'x1',
//     },
//     { id:1,
//         name:'x2',
//     },
//     { id:2,
//         name:'y1',
//     },
//     { id:3,
//         name:'y2',
//     },
//     { id:4,
//         name:'y3',
//     },
//     { id:5,
//         name:'z1',
//     },
//     { id:6,
//         name:'z2',
//     },
//     { id:7,
//         name:'z3',
//     }
// ]
// const tryEdges : Array<Edge>=[
//     {fromId: 0,
//         toId: 2,
//     },
//     {fromId: 0,
//         toId: 3,
//     },
//     {fromId: 1,
//         toId: 4,
//     },
//     {fromId: 2,
//         toId: 5,
//     },
//     {fromId: 3,
//         toId: 6,
//     },
//     {fromId: 3,
//         toId: 5,
//     },
//     {fromId: 4,
//         toId: 6,
//     },
//     {fromId: 4,
//         toId: 7,
//     },

// ]

export interface Node {
  id: number; // Уникальный идентификатор узла
  name: string; // Строковое имя узла, которое должно быть отображено
  col?: number;
  row?: number;
  children?: Array<Node>;
  parents?: Array<Node>;
}
export interface Edge {
  fromId: number; // Идентификатор узла, от которого начинается ребро
  toId: number; // Идентификатор узла, к которому ведет ребро
}

export const App = () => {
  const [graphList, setGraphList] = useState<number[] | undefined>([0, 1, 2]);
  const [graphId, setGraphId] = useState<number | undefined>(undefined);
  const [currentGraphNodes, setCurrentGraphNodes] = useState<
    Node[] | undefined
  >(undefined);
  const [currentGraphEdges, setCurrentGraphEdges] = useState<
    Edge[] | undefined
  >(undefined);

  useEffect(() => {
    fetch("/api/graphs")
      .then((resp) => resp.json())
      .then((data) => setGraphList(data));
  }, []);
  useEffect(() => {
    if (graphId !== undefined) {
      fetch(`/api/graphs/${graphId}`)
        .then((resp) => resp.json())
        .then((data) => {
          setCurrentGraphNodes(data.nodes);
          setCurrentGraphEdges(data.edges);
        });
    } else {
      setCurrentGraphNodes(undefined);
      setCurrentGraphEdges(undefined);
    }
  }, [graphId]);
  return (
    <div>
      <select
        name="graphs"
        id="graphs-select"
        onChange={(event) =>
          setGraphId(
            event.target.value ? parseInt(event.target.value) : undefined
          )
        }
      >
        <option hidden disabled selected>
          {" "}
        </option>
        {graphList?.map((graphId) => (
          <option key={"optoin" + graphId} value={graphId}>
            {graphId}
          </option>
        ))}
      </select>
      {currentGraphNodes && currentGraphEdges && graphId!==undefined && (
        <Graph nodes={currentGraphNodes} edges={currentGraphEdges} graphId={graphId} />
      )}
    </div>
  );
};


