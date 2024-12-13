import React from 'react';
import { Notification } from 'shadcn-ui';

const NotificationSystem = ({ message, type }) => {
  return (
    <Notification type={type}>
      {message}
    </Notification>
  );
};

export default NotificationSystem;
