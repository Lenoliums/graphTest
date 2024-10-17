import { useState, useEffect } from "react";
import { Node, Edge } from "./App";
import "./Graph.css";

export const Graph = (props: { nodes: Node[]; edges: Edge[]; graphId: number }) => {
    const colSize: number = 80;
    const rowSize: number = 50;
    const indentSize: number = 80;
    const [cols, setCols] = useState<Array<Array<Node>>>([[]]);
    let offset: { x: number; y: number } = { x: 0, y: 0 };
    let selectedElement: SVGUseElement | undefined = undefined;
    function sortByEdgeNum(
      node1: Node,
      node2: Node,
      param: "children" | "parents"
    ) {
      if (!node1[param] || !node2[param]) {
        return 0;
      }
      return node1[param].length - node2[param].length;
    }
    function colDistribution(node: Node, colNum: number) {
      //запись ноды в соответствующую колонку и обход всех неразмещенных детей
      if (node.col !== undefined) {
        return;
      }
      node.col = colNum;
      if (cols.length === colNum) {
        cols.push([]);
      }
      node.row = cols[colNum].length;
      cols[colNum].push(node);
      node.children?.forEach((el) => {
        colDistribution(el, colNum + 1);
        el.parents?.forEach((parent) => {
          if (parent.col === undefined) {
            colDistribution(parent, colNum);
          }
        });
      });
    }
  
    useEffect(() => {
      cols.length = 0;
      cols.push([]);
      props.edges.forEach((edge) => {
        let toNode: Node | undefined = props.nodes.find(
          (node) => node.id === edge.toId
        ); //поиск нодов по id
        let fromNode: Node | undefined = props.nodes.find(
          (node) => node.id === edge.fromId
        );
        if (fromNode && toNode) {
          fromNode.children
            ? fromNode.children.push(toNode)
            : (fromNode.children = [toNode]); //запись ребер в структуру нодов (родители, дети)
          toNode.parents
            ? toNode.parents.push(fromNode)
            : (toNode.parents = [fromNode]);
        }
      });
      props.nodes.forEach((node) => {
        node.children?.sort((a, b) => sortByEdgeNum(a, b, "parents")); //сортировка для оптимального отображения
        node.parents?.sort((a, b) => sortByEdgeNum(a, b, "children"));
      });
      let cols0 = props.nodes.filter((node) => !node.parents);
      cols0.sort((a, b) => sortByEdgeNum(a, b, "children")); //сортировка для оптимального отображения
      cols0.forEach((node) => {
        //добавление оставшихся нодов в соответствующие столбцы
        colDistribution(node, 0);
      });
  
      setCols([...cols]);
    }, [props.nodes, props.edges]);
  
    function getMousePosition(
      evt: MouseEvent,
      el: SVGUseElement | SVGTextElement | SVGLineElement
    ): { x: number; y: number } {
      var CTM = el.getScreenCTM()!;
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d,
      };
    }
  
    function onDrag(event: MouseEvent): void {
      const element = selectedElement;
      if (element === undefined) return;
  
      let coord = getMousePosition(event, element);
      element.setAttributeNS(null, "x", coord.x - offset.x + "");
      element.setAttributeNS(null, "y", coord.y - offset.y + "");
      const elementId = element.id;
      let textElement = element.parentNode?.querySelector("text");
      if (textElement) {
        let textCord = getMousePosition(event, textElement);
        textElement.setAttributeNS(null, "x", textCord.x - offset.x + 5 + "");
        textElement.setAttributeNS(
          null,
          "y",
          textCord.y - offset.y + rowSize / 2 + 3+""
        );
      }
      const lineElements = document.querySelectorAll("line");
      lineElements.forEach((lineElement) => {
        const [lineNodeFromId, lineNodeToId] = lineElement.id
          .split(":")
          .filter((_, idx) => idx > 0) as [string, string];
        if (elementId === lineNodeFromId) {
          let lineCord = getMousePosition(event, lineElement);
          lineElement.setAttributeNS(
            null,
            "x1",
            lineCord.x - offset.x + colSize + ""
          );
          lineElement.setAttributeNS(
            null,
            "y1",
            lineCord.y - offset.y + rowSize / 2 + ""
          );
        } else if (elementId === lineNodeToId) {
          let lineCord = getMousePosition(event, lineElement);
          lineElement.setAttributeNS(null, "x2", lineCord.x - offset.x + "");
          lineElement.setAttributeNS(
            null,
            "y2",
            lineCord.y - offset.y + rowSize / 2 + ""
          );
        }
      });
    }
  
    function onMouseDown(event: React.MouseEvent<SVGElement, MouseEvent>) {
      const element = event.currentTarget as SVGElement;
      const useElement = element.querySelector("use")!;
      selectedElement = useElement;
      offset = getMousePosition(event.nativeEvent, useElement);
      offset.x -= parseFloat(useElement.getAttributeNS(null, "x")!);
      offset.y -= parseFloat(useElement.getAttributeNS(null, "y")!);
  
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", () => {
          document.removeEventListener("mousemove", onDrag);
          selectedElement = undefined;
      });
    }
  
    return (
      <svg
        viewBox={`${-290+colSize*cols.length} 0 500 500`}
      >
        {
          <defs>
            <rect
              id="node_rect"
              width={colSize}
              height={rowSize}
              stroke="black"
              fill="transparent"
              strokeWidth="1"
            />
          </defs>
        }
        {cols.map((col, i) => (
          <g key={i}>
            {col.map((node, j) => {
              return (
                <g key={i + j + "rect"} onMouseDown={(ev) => onMouseDown(ev)}>
                  <use
                    id={node.id + ""}
                    xlinkHref="#node_rect"
                    x={i * (colSize + indentSize)}
                    y={j * (rowSize + indentSize)}
                  />
                  <text
                    className="rect-text"
                    x={i * (colSize + indentSize) + 5}
                    y={j * (rowSize + indentSize) + rowSize / 2 + 3}
                    fontFamily="Verdana"
                    fill="red"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        {props.nodes.map((nodeFrom) =>
          nodeFrom.children?.map((nodeTo, i) => {
            if (
              nodeTo.col !== undefined &&
              nodeTo.row !== undefined &&
              nodeFrom.col !== undefined &&
              nodeFrom.row !== undefined
            ) {
              return (
                <g key={props.graphId + "edge" + nodeFrom.id + nodeTo.id}>
                  <line
                    id={`edge:${nodeFrom.id}:${nodeTo.id}`}
                    x1={(nodeFrom.col + 1) * colSize + nodeFrom.col * indentSize}
                    y1={
                      (nodeFrom.row + 1 / 2) * rowSize + nodeFrom.row * indentSize
                    }
                    x2={nodeTo.col * (colSize + indentSize)}
                    y2={(nodeTo.row + 1 / 2) * rowSize + nodeTo.row * indentSize}
                    stroke="red"
                  />
                </g>
              );
            }
          })
        )}
      </svg>
    );
  };