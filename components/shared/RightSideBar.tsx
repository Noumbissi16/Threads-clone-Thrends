import React from "react";

const RightSideBar = () => {
  return (
    <section className="rightsidebar custom-scrollbar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium">Suggested Communities</h3>
      </div>
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium">Suggested Users</h3>
      </div>
    </section>
  );
};

export default RightSideBar;
