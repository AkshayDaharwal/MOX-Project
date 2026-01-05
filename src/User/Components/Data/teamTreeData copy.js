const teamTreeData = [
    {
        name: "John Doe",
        attributes: {
            level: "Founder",
            rewards: "$5000",
            bonus: "$1200"
        },
        children: [
            {
                name: "Alice",
                attributes: {
                    level: "Level 1",
                    rewards: "$2000",
                    bonus: "$500"
                },
                children: [
                    {
                        name: "Bob",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1200",
                            bonus: "$300"
                        },
                        children: [
                            {
                                name: "Diana",
                                attributes: {
                                    level: "Level 3",
                                    rewards: "$700",
                                    bonus: "$200"
                                }
                            },
                            {
                                name: "Elon",
                                attributes: {
                                    level: "Level 3",
                                    rewards: "$750",
                                    bonus: "$180"
                                }
                            }
                        ]
                    },
                    {
                        name: "Charlie",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1300",
                            bonus: "$350"
                        },
                        children: [
                            {
                                name: "Fiona",
                                attributes: {
                                    level: "Level 3",
                                    rewards: "$600",
                                    bonus: "$150"
                                },
                                children: [
                                    {
                                        name: "Gavin",
                                        attributes: {
                                            level: "Level 4",
                                            rewards: "$400",
                                            bonus: "$100"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "Eve",
                attributes: {
                    level: "Level 1",
                    rewards: "$2100",
                    bonus: "$600"
                },
                children: [
                    {
                        name: "Harry",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1150",
                            bonus: "$290"
                        }
                    },
                    {
                        name: "Ivy",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1250",
                            bonus: "$310"
                        },
                        children: [
                            {
                                name: "Jake",
                                attributes: {
                                    level: "Level 3",
                                    rewards: "$800",
                                    bonus: "$220"
                                }
                            },
                            {
                                name: "Karen",
                                attributes: {
                                    level: "Level 3",
                                    rewards: "$820",
                                    bonus: "$240"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                name: "Leo",
                attributes: {
                    level: "Level 1",
                    rewards: "$2150",
                    bonus: "$610"
                },
                children: [
                    {
                        name: "Mia",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1180",
                            bonus: "$300"
                        }
                    },
                    {
                        name: "Nora",
                        attributes: {
                            level: "Level 2",
                            rewards: "$1210",
                            bonus: "$305"
                        }
                    }
                ]
            }
        ]
    }
];

export default teamTreeData;
