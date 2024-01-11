const roles = [
  {
    name: "watcher",
    canCreateUserWithRole: ["declare", "creator"],
  },
  {
    name: "declare",
    canCreateUserWithRole: [],
  },
  {
    name: "creator",
    canCreateUserWithRole: ["super"],
  },
  {
    name: "super",
    canCreateUserWithRole: ["master", "user"],
  },
  {
    name: "master",
    canCreateUserWithRole: ["agent", "user"],
  },
  {
    name: "agent",
    canCreateUserWithRole: ["user"],
  },
  {
    name: "user",
    canCreateUserWithRole: null,
  },
];

const roleIndex = {
	"watcher": 0,
	"declare": 1,
	"creator": 2,
	"super": 3,
	"master": 4,
	"agent": 5,
	"user": 6 
}

const getRoleByName = (roleName) => {
	return roles[roleIndex[roleName]]
}

module.exports = { roles, getRoleByName };
