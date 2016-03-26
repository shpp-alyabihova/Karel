var shppMaps = {
	"Newspaper" : {name:"Newspaper",original:{map:[["","","","","","","","","",""],["","","x","x","x","x","x","","",""],["","","x","","","","x","","",""],["","","x","","","","",1,"",""],["","","x","","","","x","","",""],["","","x","x","x","x","x","","",""],["","","","","","","","","",""]],karel:{position:[3,2],direction:1,beepers:1000}},final:[{map:[["","","","","","","","","",""],["","","x","x","x","x","x","","",""],["","","x","","","","x","","",""],["","","x","","","","","","",""],["","","x","","","","x","","",""],["","","x","x","x","x","x","","",""],["","","","","","","","","",""]],karel:{position:[3,2],direction:3,beepers:1000}},{map:[["","","","","","","","","",""],["","","x","x","x","x","x","","",""],["","","x","","","","x","","",""],["","","x","","","","","","",""],["","","x","","","","x","","",""],["","","x","x","x","x","x","","",""],["","","","","","","","","",""]],karel:{position:[3,2],direction:2,beepers:1000}},{map:[["","","","","","","","","",""],["","","x","x","x","x","x","","",""],["","","x","","","","x","","",""],["","","x","","","","","","",""],["","","x","","","","x","","",""],["","","x","x","x","x","x","","",""],["","","","","","","","","",""]],karel:{position:[3,2],direction:1,beepers:1000}}],description:"Take the beeper ant turn back", secretOwnership:true},
	"Wallbuilder-1" : {name:"Wallbuilder-1",original:{map:[["","x","x","x","","x","x","x","","x","x","x",""],["x","x","","x","x","x","","x","x","x","","x","x"],["x","","","","x","","","","x","","","","x"],[1,"","","","","","","","","","","",""],[1,"","","",1,"","","","","","","",""],["","","","",1,"","","","","","","",""],["","","","","","","","",1,"","","",""],["","","","",1,"","","",1,"","","",""],["","","","","","","","",1,"","","",1]],karel:{position:[0,8],direction:1,beepers:1000}},final:[{map:[["","x","x","x","","x","x","x","","x","x","x",""],["x","x","","x","x","x","","x","x","x","","x","x"],["x","","","","x","","","","x","","","","x"],[1,"","","",1,"","","",1,"","","",1],[1,"","","",1,"","","",1,"","","",1],[1,"","","",1,"","","",1,"","","",1],[1,"","","",1,"","","",1,"","","",1],[1,"","","",1,"","","",1,"","","",1],[1,"","","",1,"","","",1,"","","",1]],karel:{position:[12,8],direction:1,beepers:1000}}],description:"Build all columns with beepers, one for each cell.", secretOwnership:true},
	"Wallbuilder-2" : {name:"Wallbuilder-2",original:{map:[["","x","x","x","","x","x","x","","x","x","x","","x","x"],["x","x","","x","x","x","","x","x","x","","x","x","x",""],["x","","","","x","","","","x","","","","x","",""],[1,"","","",1,"","","","","","","","","",""],[1,"","","",1,"","","","","","","","","",""],["","","","",1,"","","","","","","",1,"",""],["","","","",1,"","","","","","","","","",""],["","","","",1,"","","","","","","","","",""],["","","","",1,"","","",1,"","","","","",""]],karel:{position:[0,8],direction:1,beepers:1000}},final:[{map:[["","x","x","x","","x","x","x","","x","x","x","","x","x"],["x","x","","x","x","x","","x","x","x","","x","x","x",""],["x","","","","x","","","","x","","","","x","",""],[1,"","","",1,"","","",1,"","","",1,"",""],[1,"","","",1,"","","",1,"","","",1,"",""],[1,"","","",1,"","","",1,"","","",1,"",""],[1,"","","",1,"","","",1,"","","",1,"",""],[1,"","","",1,"","","",1,"","","",1,"",""],[1,"","","",1,"","","",1,"","","",1,"",""]],karel:{position:[14,8],direction:1,beepers:1000}}],description:"Build all columns with beepers, one for each cell.", secretOwnership:true},
	"Middlepoint search" : {name:"Middlepoint search",original:{map:[["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]],karel:{position:[0,5],direction:1,beepers:1000}},final:[{map:[["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","",1,"",""]],karel:{position:[2,5],direction:1,beepers:1000}},{map:[["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","",1,"",""]],karel:{position:[2,5],direction:3,beepers:1000}}],description:"Put a beeper to a middle cell of the map.", secretOwnership:true},
	"Chess board" : {name:"Chessboard",original:{map:[["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]],karel:{position:[0,5],direction:1,beepers:1000}},final:[{map:[["",1,"",1,""],[1,"",1,"",1],["",1,"",1,""],[1,"",1,"",1],["",1,"",1,""],[1,"",1,"",1]],karel:{position:[4,0],direction:2,beepers:1000}},{map:[[1,"",1,"",1],["",1,"",1,""],[1,"",1,"",1],["",1,"",1,""],[1,"",1,"",1],["",1,"",1,""]],karel:{position:[4,0],direction:2,beepers:1000}}],description:"Put a beeper to a middle cell of the map.", secretOwnership:true}
};

for (var key in shppMaps) {
	if (shppMaps.hasOwnProperty(key)) {
		Storage.addMap(key, shppMaps[key]);
	}
}