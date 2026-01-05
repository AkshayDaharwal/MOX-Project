import { useRef, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import { appConfig } from "../../config/appConfig";

const TeamTreeView = () => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainer = useRef(null);
  const navigate = useNavigate();

  const API_URL = `${appConfig.baseURL}/user/team-tree-view`;

  // Fetch tree data using useQuery
  const { data: treeData = null, isLoading, isError, error } = useQuery({
    queryKey: ["teamTreeView"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid token. Please log in again.");
        }
        throw new Error("Failed to fetch team tree data");
      }

      const responseData = await response.json();
      console.log("Full API Response:", JSON.stringify(responseData, null, 2));

      const apiData = responseData.data || (responseData.result && responseData.result.data) || {};
      if (!apiData.data || apiData.data.length === 0) {
        throw new Error("No team data returned from API");
      }

      return [
        {
          name: apiData.data[0]?.name || "Unknown",
          username: apiData.data[0]?.username || "Unknown",
          plan: apiData.data[0]?.plan || "N/A",
          selfInvestment: apiData.selfInvestment || 0,
          teamInvestment: apiData.teamInvestment || 0,
          children: (apiData.data[0]?.children || []).map((child) => ({
            ...child,
            name: child.name || "Unknown",
            username: child.username || "Unknown",
            plan: child.plan || "N/A",
            selfInvestment: child.selfInvestment || 0,
            teamInvestment: child.teamInvestment || 0,
            children: child.children || [],
          })),
        },
      ];
    },
    enabled: !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken"),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  // Center tree on mount and resize with retry mechanism
  useEffect(() => {
    let retries = 0;
    const maxRetries = 5;
    const retryDelay = 100; // ms

    const centerTree = () => {
      if (treeContainer.current) {
        const { width, height } = treeContainer.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          const centerX = width / 2;
          const centerY = height / 2;
          setTranslate({ x: centerX, y: centerY });
          console.log("Centered Tree:", { width, height, x: centerX, y: centerY });
        } else if (retries < maxRetries) {
          console.warn("Invalid dimensions, retrying:", { width, height, retry: retries + 1 });
          retries += 1;
          setTimeout(centerTree, retryDelay);
        } else {
          console.error("Failed to center tree after max retries:", { width, height });
        }
      } else {
        console.warn("treeContainer.current is not available, retrying:", { retry: retries + 1 });
        if (retries < maxRetries) {
          retries += 1;
          setTimeout(centerTree, retryDelay);
        }
      }
    };

    // Initial centering
    centerTree();

    // Handle resize
    const handleResize = () => {
      retries = 0; // Reset retries on resize
      centerTree();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Custom styled node
  const renderNodeWithCustomStyles = useCallback(
    ({ nodeDatum, toggleNode }) => {
      console.log("Rendering Node:", nodeDatum);
      return (
        <g onClick={toggleNode}>
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
            {nodeDatum.username || "Unknown"}
          </text>
          <text
            x={30}
            dy="5"
            fontSize={12}
            fill="#cbd5e1"
            stroke="#000"
            strokeWidth={0.5}
            paintOrder="stroke"
          >
            Plan: {nodeDatum.plan || "N/A"}
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
            Self: ${nodeDatum.selfInvestment || 0}
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
            Team: ${nodeDatum.teamInvestment || 0}
          </text>
        </g>
      );
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width: "100%", height: "90vh" }}>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center" style={{ width: "100%", height: "90vh" }}>
        <p className="text-red-500">{error?.message || "Failed to fetch team tree data."}</p>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: "100%", height: "90vh" }}>
        <p className="text-white">No team members found.</p>
      </div>
    );
  }

  return (
    <div
      ref={treeContainer}
      style={{
        width: "100%",
        height: "90vh",
        position: "relative",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div className="text-xs absolute left-4 top-4 rounded-xl bg-gray-800 text-white shadow-lg w-fit p-4 space-y-1">
        <p className="font-bold text-sm text-primary mb-1">Manual</p>
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

      <Tree
        data={treeData}
        translate={translate}
        orientation="vertical"
        pathFunc="diagonal"
        collapsible={true}
        zoomable={true}
        draggable={true}
        renderCustomNodeElement={renderNodeWithCustomStyles}
        separation={{ siblings: 1, nonSiblings: 1.5 }}
        initialDepth={3}
        zoom={0.6}
        enableLegacyTransitions={true}
        shouldCollapseNeighborNodes={false}
        pathClassFunc={() => "custom-link-path"}
      />
    </div>
  );
};

export default TeamTreeView;