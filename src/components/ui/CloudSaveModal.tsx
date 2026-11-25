import { useState, useEffect, useSyncExternalStore } from 'react'
import { getSyncController } from '../../cloud/runtime'
import type { SaveSummary } from '../../cloud/saveFormat'
import {
  cloudService,
  wwwAuthUrl,
  WWW_ACCOUNT_URL,
  type LeaderboardEntry,
  type WwwUser
} from '../../utils/supabaseClient'
import { X, CloudCheck, Database, Trophy, LogIn, UserCheck, Lock, AlertCircle, ExternalLink } from 'lucide-react'

function SummaryRows({ summary }: { summary: SaveSummary }) {
  const rows: [string, string | number][] = [
    ['Ải hiện tại', summary.currentStageIndex + 1],
    ['Ải cao nhất', summary.maxUnlockedStage + 1],
    ['Tháp cao nhất', summary.maxTowerFloor],
    ['Cấp bậc', summary.rankLevel],
    ['Điểm PvP', summary.pvpScore],
    ['Vàng', summary.gold.toLocaleString('vi-VN')],
    ['Số tướng', summary.heroCount]
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ color: '#94a3b8' }}>{label}:</span>
          <strong style={{ color: '#e2e8f0' }}>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function formatViTime(ts: number | string | null | undefined): string {
  if (ts === null || ts === undefined) return ''
  const date = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('vi-VN')
}

export default function CloudSaveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ctrl = getSyncController()
  const snap = useSyncExternalStore(ctrl.subscribe, ctrl.getSnapshot)

  const [inFlight, setInFlight] = useState<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<WwwUser | null>(() => cloudService.getCurrentUser())

  const busy = inFlight || snap.status === 'syncing'

  const runAction = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setInFlight(true)
    try {
      await fn()
    } finally {
      setInFlight(false)
    }
  }

  const loadLeaderboard = async () => {
    const data = await cloudService.fetchLeaderboard()
    if (data && data.length > 0) {
      setLeaderboard(data)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(cloudService.getCurrentUser())
      void loadLeaderboard()
    }
  }, [isOpen])

  if (!isOpen) return null

  const primaryBtnStyle = (gradient: string, disabled: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: '180px',
    background: gradient,
    border: 'none',
    color: 'white',
    borderRadius: '12px',
    padding: '10px 16px',
    fontWeight: 'bold',
    fontSize: '0.88rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  })

  const secondaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'rgba(148, 163, 184, 0.16)',
    border: '1px solid rgba(148, 163, 184, 0.45)',
    color: '#e2e8f0',
    borderRadius: '12px',
    padding: '10px 16px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  })

  const loginLinkButton = (
    <a
      href={wwwAuthUrl('signin')}
      style={{
        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
        border: 'none',
        color: 'white',
        borderRadius: '12px',
        padding: '9px 16px',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
      }}
    >
      <LogIn size={16} /> Đăng nhập YunDev
    </a>
  )

  const renderLegacyImportBanner = () => (
    <div style={{
      marginTop: '12px',
      background: 'rgba(56, 189, 248, 0.12)',
      border: '1px solid rgba(56, 189, 248, 0.45)',
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <span style={{ fontSize: '0.88rem', color: '#bae6fd' }}>
        Tìm thấy tiến trình cũ của tài khoản.
      </span>
      <button
        onClick={() => void runAction(() => ctrl.importLegacy())}
        disabled={busy}
        style={primaryBtnStyle('linear-gradient(45deg, #0284c7, #38bdf8)', busy)}
      >
        Nhập tiến trình cũ
      </button>
    </div>
  )

  const renderSyncContent = () => {
    switch (snap.status) {
      case 'signed_out':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#fde68a' }}>
              Đăng nhập để lưu tiến trình lên cloud.
            </span>
            {loginLinkButton}
          </div>
        )

      case 'syncing':
        return (
          <div style={{ fontSize: '0.9rem', color: '#7dd3fc', fontWeight: 'bold' }}>
            Đang đồng bộ…
          </div>
        )

      case 'synced':
      case 'idle': {
        if (snap.notice === 'local_only') {
          return (
            <div style={{ fontSize: '0.9rem', color: '#fde68a' }}>
              Đang giữ bản trên máy, không đồng bộ với tài khoản này.
            </div>
          )
        }
        const syncedTime = formatViTime(snap.lastSyncedAt)
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.9rem', color: '#86efac' }}>
                Đã đồng bộ{syncedTime ? ` (${syncedTime})` : ''}
              </div>
              <button
                onClick={() => void runAction(() => ctrl.syncNow())}
                disabled={busy}
                style={{
                  ...primaryBtnStyle('linear-gradient(45deg, #0284c7, #38bdf8)', busy),
                  flex: '0 0 auto',
                  minWidth: 'auto'
                }}
              >
                Đồng bộ ngay
              </button>
            </div>
            {snap.legacyAvailable && snap.cloudSummary === null && renderLegacyImportBanner()}
          </div>
        )
      }

      case 'disabled':
        return (
          <div style={{ fontSize: '0.9rem', color: '#fde68a' }}>
            Lưu cloud chưa được bật. Tiến trình vẫn được lưu trên máy này.
          </div>
        )

      case 'offline':
      case 'error':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#fca5a5' }}>
              <AlertCircle size={18} />
              <span>Không kết nối được cloud. Sẽ thử lại tự động.</span>
            </div>
            <button
              onClick={() => void runAction(() => ctrl.syncNow())}
              disabled={busy}
              style={{
                ...primaryBtnStyle('linear-gradient(45deg, #0284c7, #38bdf8)', busy),
                flex: '0 0 auto',
                minWidth: 'auto'
              }}
            >
              Thử lại
            </button>
          </div>
        )

      case 'session_expired':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#fca5a5' }}>
              Phiên đăng nhập đã hết hạn.
            </span>
            {loginLinkButton}
          </div>
        )

      case 'conflict': {
        const localSum = snap.conflict?.client.summary ?? snap.localSummary
        const serverInfo = snap.conflict?.server ?? null
        const serverSum = serverInfo?.summary ?? snap.cloudSummary
        const serverTime = formatViTime(serverInfo?.updated_at ?? snap.cloudUpdatedAt)

        return (
          <div>
            <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Có hai bản lưu khác nhau
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.35)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#7dd3fc', marginBottom: '8px', fontSize: '0.9rem' }}>
                  Trên máy này
                </div>
                {localSum ? <SummaryRows summary={localSum} /> : null}
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.45)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#4ade80', marginBottom: '8px', fontSize: '0.9rem' }}>
                  Trên cloud{serverTime ? ` (${serverTime})` : ''}
                </div>
                {serverSum ? (
                  <SummaryRows summary={serverSum} />
                ) : (
                  <div style={{ fontSize: '0.84rem', color: '#fca5a5' }}>
                    Không đọc được bản trên cloud
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                onClick={() => void runAction(() => ctrl.chooseCloud())}
                disabled={busy}
                style={primaryBtnStyle('linear-gradient(45deg, #059669, #10b981)', busy)}
              >
                Dùng bản trên cloud
              </button>
              <button
                onClick={() => void runAction(() => ctrl.chooseLocal())}
                disabled={busy || !snap.canKeepLocal}
                style={primaryBtnStyle('linear-gradient(45deg, #0284c7, #38bdf8)', busy || !snap.canKeepLocal)}
              >
                Dùng bản trên máy
              </button>
            </div>

            {!snap.canKeepLocal && (
              <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginBottom: '8px' }}>
                Bản trên cloud mới hơn phiên bản game này — hãy tải lại trang để cập nhật.
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Bản bị thay thế sẽ được giữ lại 7 ngày để hoàn tác.
            </div>
          </div>
        )
      }

      case 'offer_restore':
        return (
          <div>
            <div style={{ fontSize: '0.9rem', color: '#7dd3fc', marginBottom: '10px', fontWeight: 'bold' }}>
              Tài khoản này đã có tiến trình trên cloud.
            </div>
            {snap.cloudSummary && (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                <SummaryRows summary={snap.cloudSummary} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => void runAction(() => ctrl.chooseCloud())}
                disabled={busy}
                style={primaryBtnStyle('linear-gradient(45deg, #059669, #10b981)', busy)}
              >
                Khôi phục từ cloud
              </button>
              <button
                onClick={() => ctrl.dismiss()}
                disabled={busy}
                style={secondaryBtnStyle(busy)}
              >
                Để sau
              </button>
            </div>
          </div>
        )

      case 'offer_import':
        return renderLegacyImportBanner()

      case 'account_mismatch':
        return (
          <div>
            <div style={{ fontSize: '0.9rem', color: '#fbbf24', marginBottom: '12px', fontWeight: 'bold' }}>
              Tiến trình trên máy này thuộc một tài khoản khác.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {snap.cloudSummary !== null && (
                <button
                  onClick={() => void runAction(() => ctrl.chooseCloud())}
                  disabled={busy}
                  style={primaryBtnStyle('linear-gradient(45deg, #059669, #10b981)', busy)}
                >
                  Dùng bản trên cloud của tài khoản này
                </button>
              )}
              <button
                onClick={() => void runAction(() => ctrl.chooseLocal())}
                disabled={busy}
                style={primaryBtnStyle('linear-gradient(45deg, #0284c7, #38bdf8)', busy)}
              >
                Giữ bản trên máy, không đồng bộ
              </button>
              <button
                onClick={() => ctrl.dismiss()}
                disabled={busy}
                style={secondaryBtnStyle(busy)}
              >
                Để sau
              </button>
            </div>
          </div>
        )

      case 'cloud_unsupported':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#fca5a5' }}>
            <AlertCircle size={18} />
            <span>Cần cập nhật: bản lưu trên cloud được tạo bởi phiên bản game mới hơn. Hãy tải lại trang.</span>
          </div>
        )
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 10, 20, 0.95)',
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 10px 50px rgba(56, 189, 248, 0.3)',
        color: 'white',
        position: 'relative'
      }}>
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CloudCheck color="#38bdf8" /> Supabase Cloud Save & Đăng nhập YunDev
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
          Đồng bộ tài khoản dùng chung qua <code>www.yundev.space</code>.
        </p>

        {/* Trạng Thái Tài Khoản YunDev */}
        <div style={{
          background: currentUser ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: currentUser ? '1px solid #22c55e' : '1px solid #f59e0b',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: currentUser ? '#4ade80' : '#fbbf24' }}>
              {currentUser ? <UserCheck size={20} /> : <Lock size={20} />}
              <span>{currentUser ? `Đã đăng nhập YunDev: ${currentUser.displayName}` : 'Tài khoản: Khách'}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              {currentUser
                ? 'Tài khoản đang sử dụng phiên đăng nhập dùng chung từ YunDev.space.'
                : 'Đăng nhập tài khoản YunDev để liên kết hồ sơ người chơi.'}
            </div>
          </div>

          <div>
            {currentUser ? (
              <a
                href={WWW_ACCOUNT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  border: '1px solid #38bdf8',
                  color: '#7dd3fc',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={16} /> Quản lý tài khoản / Đăng xuất tại YunDev.space
              </a>
            ) : (
              <button
                onClick={() => window.location.assign(wwwAuthUrl('signin'))}
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <LogIn size={16} /> Đăng nhập YunDev
              </button>
            )}
          </div>
        </div>

        {/* Trạng Thái Đồng Bộ Cloud */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#7dd3fc', fontSize: '1.05rem', marginBottom: '12px' }}>
            <Database size={20} /> Tài Khoản Cloud: <span style={{ color: '#fef08a' }}>{cloudService.getPlayerName()}</span>
          </div>

          {snap.notice === 'import_exists' && (
            <div style={{ fontSize: '0.88rem', color: '#fbbf24', marginBottom: '10px', fontWeight: 'bold' }}>
              Đã có bản lưu cloud; không thể nhập bản cũ.
            </div>
          )}

          {renderSyncContent()}

          {snap.backupAvailable && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <button
                onClick={() => {
                  if (window.confirm('Hoàn tác và khôi phục bản đã được giữ lại?')) {
                    void runAction(() => ctrl.undoLastChoice())
                  }
                }}
                disabled={busy}
                style={{
                  ...secondaryBtnStyle(busy),
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
              >
                Hoàn tác lựa chọn gần nhất
              </button>
            </div>
          )}
        </div>

        {/* Bảng Xếp Hạng Top Cao Thủ Cloud */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="#f1c40f" size={20} /> Bảng Xếp Hạng Cao Thủ Toàn Máy Chủ (Supabase Cloud)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((player, idx) => (
                <div key={player.rank} style={{
                  background: idx === 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                  border: idx === 0 ? '1.5px solid #f1c40f' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: idx === 0 ? '#fef08a' : '#e2e8f0' }}>{player.display_name || 'Cao Thủ Sử Việt'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Màn chơi: Ải {Number(player.max_unlocked_stage || 0) + 1}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: idx === 0 ? '#f1c40f' : '#38bdf8', fontSize: '1.05rem' }}>
                    ⚔️ {player.pvp_score || 1250} Điểm PvP
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}>
                Chưa có dữ liệu bảng xếp hạng từ Supabase Cloud.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
