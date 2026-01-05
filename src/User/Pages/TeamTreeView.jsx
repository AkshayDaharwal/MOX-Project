import React, { useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Tree from "react-d3-tree";
import axios from "axios";
import { appConfig } from "../../config/appConfig";

const TeamTreeView = () => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainer = useRef(null);

  // Transform API data to match react-d3-tree format
  const transformTreeData = useCallback((apiData) => {
    if (!apiData?.data?.data || !Array.isArray(apiData.data.data)) {
      return [];
    }
    const transformNode = (node) => ({
      name: node.name || "Unknown",
      attributes: {
        Username: node.username || "Unknown",
        Self: `$${node.selfInvestment || 0}`,
        Team: `$${node.teamInvestment || 0}`,
      },
      children: node.children ? node.children.map(transformNode) : [],
    });
    return apiData.data.data.map(transformNode);
  }, []);

  // Fetch team tree data using useQuery
  const { data: teamTreeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["teamTree"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axios.get(`${appConfig.baseURL}/user/team-tree-view`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return transformTreeData(response.data);
    },
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    retry: 2, // Retry failed requests twice
    enabled: !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken"), // Only fetch if token exists
  });

  // Update translate on resize
  useEffect(() => {
    const updateTranslate = () => {
      if (treeContainer.current) {
        const dimensions = treeContainer.current.getBoundingClientRect();
        if (dimensions.width && dimensions.height) {
          setTranslate({
            x: dimensions.width / 2,
            y: dimensions.height / 4,
          });
        }
      }
    };

    updateTranslate();
    window.addEventListener("resize", updateTranslate);
    return () => window.removeEventListener("resize", updateTranslate);
  }, []);

  // Custom styled node
  const renderNodeWithCustomStyles = useCallback(
    ({ nodeDatum, toggleNode }) => (
      <g
        onClick={toggleNode}
        role="button"
        aria-label={`Toggle node for ${nodeDatum.name || "Unknown"}`}
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && toggleNode()}
      >
        <circle r={20} fill="#2298D3" stroke="#fff" strokeWidth={2} />
        <path
          d="M 0 0 a 15.5 15 0 1 1 30 0 z"
          fill="#10B981"
          transform="translate(-7, -28) rotate(15)"
          stroke="none"
        />
        <circle cx={5} cy={-33} r={2} fill="#ffffff" stroke="none" />
        <circle cx={15} cy={-30} r={2} fill="#ffffff" stroke="none" />
        <text
          x={30}
          dy="-10"
          fontSize={14}
          fontWeight="bold"
          textAnchor="start"
          fill="#05CE99"
          stroke="#000000"
          strokeWidth={0.75}
          paintOrder="stroke"
        >
          {/* {nodeDatum.name || "Unknown"} */}
        </text>
        {nodeDatum.attributes && (
          <>
            <text
              x={30}
              dy="5"
              fontSize={12}
              fill="#cbd5e1"
              stroke="#000"
              strokeWidth={0.5}
              paintOrder="stroke"
            >
              Username: {nodeDatum.attributes.Username || "Unknown"}
            </text>
            <text
              x={30}
              dy="20"
              fontSize={12}
              fill="#cbd5e1"
              stroke="#000"
              strokeWidth={0.5}
              paintOrder="stroke"
            >
              Self: {nodeDatum.attributes.Self || "$0"}
            </text>
            <text
              x={30}
              dy="35"
              fontSize={12}
              fill="#cbd5e1"
              stroke="#000"
              strokeWidth={0.5}
              paintOrder="stroke"
            >
              Team: {nodeDatum.attributes.Team || "$0"}
            </text>
          </>
        )}
      </g>
    ),
    []
  );

  return (
    <div
      ref={treeContainer}
      className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50"
      style={{ width: "100%", height: "90vh", position: "relative", overflow: "auto" }}
    >
      <div className="text-xs absolute left-4 top-4 rounded-xl bg-gray-800 p-4 text-white shadow-lg w-fit space-y-1 z-10">
        <p className="font-bold text-sm text-blue-300 mb-1">Manual</p>
        <p>
          <span className="text-green-300">Click node</span> → Expand / Collapse team
        </p>
        <p>
          <span className="text-blue-300">Scroll</span> → Zoom in / out
        </p>
        <p>
          <span className="text-pink-300">Drag background</span> → Pan around
        </p>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg z-10">
          Loading...
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-lg z-10">
          <div className="text-center">
            <p>Error: {error?.message || "Failed to fetch team tree data"}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => refetch()}
              aria-label="Retry fetching team tree data"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {!isLoading && !isError && teamTreeData && teamTreeData.length > 0 && (
        <Tree
          data={teamTreeData}
          translate={translate}
          orientation="vertical"
          pathFunc="diagonal"
          collapsible={true}
          zoomable={true}
          draggable={true}
          renderCustomNodeElement={renderNodeWithCustomStyles}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          enableLegacyTransitions={true}
          shouldCollapseNeighborNodes={true}
          pathClassFunc={() => "custom-link-path"}
          zoom={0.8}
          scaleExtent={{ min: 0.1, max: 2 }}
        />
      )}
      {!isLoading && !isError && (!teamTreeData || teamTreeData.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg z-10">
          No team data available
        </div>
      )}
    </div>
  );
};

export default TeamTreeView;