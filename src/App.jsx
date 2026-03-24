import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useMatch,
} from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Button, Menu, Drawer } from "antd";
import {
  MoonOutlined,
  SunOutlined,
  BookOutlined,
  FileTextOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import WordManagement from "./pages/WordManagement";
import ArticleManagement from "./pages/ArticleManagement";
import CET4Wordbook from "./pages/CET4Wordbook";
// import StudyRecords from "./pages/StudyRecords";
import BackupRestore from "./components/BackupRestore";

// 页面标题组件
const PageTitle = () => {
  const location = useLocation();
  
  // 路由标题映射
  const routeTitles = {
    "/words": "单词管理 - WordNest",
    "/articles": "文章管理 - WordNest",
    "/cet4": "四级词库 - WordNest",
  };

  useEffect(() => {
    const title = routeTitles[location.pathname] || "WordNest";
    document.title = title;
  }, [location.pathname]);

  return null;
};

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <Router>
      <PageTitle />
      <div className="w-full min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-5 pt-0  pb-0 border-b border-border bg-bg flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-1">
            {/* Logo图片 - 在小屏幕上隐藏 */}
            <img 
              src="/logo.png" 
              alt="WordNest Logo" 
              className="h-10 w-10 object-contain md:block hidden"
            />
            <h1 className="m-0 text-2xl md:text-4xl font-medium text-text-h">
              WordNest
            </h1>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* 桌面端菜单 */}
            <nav className="hidden md:flex">
              <Menu
                mode="horizontal"
                defaultSelectedKeys={["words"]}
                className="bg-bg border-b-0"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
                itemStyle={{ color: "var(--text)" }}
                selectedKeys={["words"]}
              >
                <Menu.Item
                  key="words"
                  icon={<BookOutlined />}
                  className="text-text"
                >
                  <Link to="/words">单词管理</Link>
                </Menu.Item>
                <Menu.Item
                  key="articles"
                  icon={<FileTextOutlined />}
                  className="text-text"
                >
                  <Link to="/articles">文章管理</Link>
                </Menu.Item>
                <Menu.Item
                  key="cet4"
                  icon={<BookOutlined />}
                  className="text-text"
                >
                  <Link to="/cet4">四级词库</Link>
                </Menu.Item>
              </Menu>
            </nav>
            
            {/* 桌面端的备份和主题切换按钮 */}
            <div className="hidden md:flex items-center gap-2.5">
              <BackupRestore />
              {/* <Button
                icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleTheme}
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                
              </Button> */}
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <Button
                icon={<MenuOutlined />}
                onClick={() => setIsMobileMenuOpen(true)}
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                菜单
              </Button>
            </div>
          </div>
        </header>
        
        {/* 移动端菜单抽屉 */}
        <Drawer
          title="WordNest"
          placement="left"
          onClose={() => setIsMobileMenuOpen(false)}
          open={isMobileMenuOpen}
          className="md:hidden"
        >
          <Menu
            mode="vertical"
            defaultSelectedKeys={["words"]}
            className="bg-bg border-b-0"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
            }}
            itemStyle={{ color: "var(--text)" }}
            selectedKeys={["words"]}
          >
            <Menu.Item
              key="words"
              icon={<BookOutlined />}
              className="text-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/words">单词管理</Link>
            </Menu.Item>
            <Menu.Item
              key="articles"
              icon={<FileTextOutlined />}
              className="text-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/articles">文章管理</Link>
            </Menu.Item>
            <Menu.Item
              key="cet4"
              icon={<BookOutlined />}
              className="text-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link to="/cet4">四级词库</Link>
            </Menu.Item>
            <Menu.Item
              key="backup"
              className="text-text"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <BackupRestore />
              备份
            </Menu.Item>
            {/* <Menu.Item
              key="theme"
              icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
              className="text-text"
              onClick={toggleTheme}
            >
              {theme === "light" ? "切换到深色主题" : "切换到浅色主题"}
            </Menu.Item> */}
          </Menu>
        </Drawer>
        
        <main className="flex-1 p-5 md:p-10 bg-bg">
          <Routes>
            
            <Route path="/words" element={<WordManagement />} />
            <Route path="/articles" element={<ArticleManagement />} />
            <Route path="/cet4" element={<CET4Wordbook />} />
            <Route path="*" element={<Navigate to="/words" />} />
          </Routes>
        </main>
        <footer className="p-5 border-t border-border bg-bg text-center text-text-secondary">
          <p>© 2026 WordNest</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
