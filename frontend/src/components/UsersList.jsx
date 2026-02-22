import "../styles/Components.css"

function UsersList({ users }) {
  const getAvatarColor = (role) => {
    switch (role) {
      case "host":
        return "#fbbf24"
      case "admin":
        return "#a78bfa"
      default:
        return "#9ca3af"
    }
  }

  return (
    <div className="users-list">
      {users.length === 0 ? (
        <p className="empty-state">No users yet</p>
      ) : (
        users.map((user, index) => (
          <div key={index} className="user-card">
            <div className="user-avatar" style={{ backgroundColor: getAvatarColor(user.role) }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user.username}</p>
              <span className={`user-role role-${user.role.toLowerCase()}`}>{user.role}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default UsersList
