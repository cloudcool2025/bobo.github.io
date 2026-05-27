export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: 'rgba(22, 101, 52, 0.9)', 
        borderRadius: '16px', 
        padding: '32px', 
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎱</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '16px' }}>
          台球计分小程序
        </h1>
        <div style={{ color: '#fef3c7', marginBottom: '24px' }}>
          <p>部署成功！</p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#fde68a' }}>
            如果你能看到这个页面，说明应用工作正常！
          </p>
        </div>
      </div>
    </div>
  );
}
