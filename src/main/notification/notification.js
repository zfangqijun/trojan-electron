const { Notification } = require('electron');

module.exports = {
    show: function ({ title, body }) {
        if (Notification.isSupported()) {
            new Notification({
                title,
                body
            }).show()
        }
    }
}