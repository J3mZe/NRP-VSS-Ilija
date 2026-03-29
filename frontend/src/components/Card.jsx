import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
