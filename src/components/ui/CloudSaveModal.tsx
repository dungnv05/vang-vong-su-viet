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
          <span style={{ color: 'var(--vv-muted)' }}>{label}:</span>
          <strong style={{ color: 'var(--vv-text-2)' }}>{value}</strong>
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
    color: 'var(--vv-on-solid)',
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
    background: 'var(--vv-secondary-bg)',
    border: '1px solid var(--vv-secondary-border)',
    color: 'var(--vv-text-2)',
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
        background: 'var(--vv-btn-gold-grad-short)',
        border: 'none',
        color: 'var(--vv-on-solid)',
        borderRadius: '12px',
        padding: '9px 16px',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: 'var(--vv-btn-gold-shadow)'
      }}
    >
      <LogIn size={16} /> Đăng nhập YunDev
    </a>
  )

  const renderLegacyImportBanner = () => (
    <div style={{
      marginTop: '12px',
      background: 'var(--vv-sky-tint)',
      border: '1px solid var(--vv-sky-border)',
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <span style={{ fontSize: '0.88rem', color: 'var(--vv-sky-soft)' }}>
        Tìm thấy tiến trình cũ của tài khoản.
      </span>
      <button
        onClick={() => void runAction(() => ctrl.importLegacy())}
        disabled={busy}
        style={primaryBtnStyle('var(--vv-menu-sky-grad)', busy)}
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
            <span style={{ fontSize: '0.9rem', color: 'var(--vv-gold-soft)' }}>
              Đăng nhập để lưu tiến trình lên cloud.
            </span>
            {loginLinkButton}
          </div>
        )

      case 'syncing':
        return (
          <div style={{ fontSize: '0.9rem', color: 'var(--vv-sky-text)', fontWeight: 'bold' }}>
            Đang đồng bộ…
          </div>
        )

      case 'synced':
      case 'idle': {
        if (snap.notice === 'local_only') {
          return (
            <div style={{ fontSize: '0.9rem', color: 'var(--vv-gold-soft)' }}>
              Đang giữ bản trên máy, không đồng bộ với tài khoản này.
            </div>
          )
        }
        const syncedTime = formatViTime(snap.lastSyncedAt)
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--vv-green-soft)' }}>
                Đã đồng bộ{syncedTime ? ` (${syncedTime})` : ''}
              </div>
              <button
                onClick={() => void runAction(() => ctrl.syncNow())}
                disabled={busy}
                style={{
                  ...primaryBtnStyle('var(--vv-menu-sky-grad)', busy),
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
          <div style={{ fontSize: '0.9rem', color: 'var(--vv-gold-soft)' }}>
            Lưu cloud chưa được bật. Tiến trình vẫn được lưu trên máy này.
          </div>
        )

      case 'offline':
      case 'error':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--vv-red-soft)' }}>
              <AlertCircle size={18} />
              <span>Không kết nối được cloud. Sẽ thử lại tự động.</span>
            </div>
            <button
              onClick={() => void runAction(() => ctrl.syncNow())}
              disabled={busy}
              style={{
                ...primaryBtnStyle('var(--vv-menu-sky-grad)', busy),
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
            <span style={{ fontSize: '0.9rem', color: 'var(--vv-red-soft)' }}>
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
            <div style={{ fontWeight: 'bold', color: 'var(--vv-gold)', fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> Có hai bản lưu khác nhau
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--vv-subcard-bg)', border: '1px solid var(--vv-secondary-border)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--vv-sky-text)', marginBottom: '8px', fontSize: '0.9rem' }}>
                  Trên máy này
                </div>
                {localSum ? <SummaryRows summary={localSum} /> : null}
              </div>

              <div style={{ background: 'var(--vv-subcard-bg)', border: '1px solid var(--vv-sky-border)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--vv-green-soft)', marginBottom: '8px', fontSize: '0.9rem' }}>
                  Trên cloud{serverTime ? ` (${serverTime})` : ''}
                </div>
                {serverSum ? (
                  <SummaryRows summary={serverSum} />
                ) : (
                  <div style={{ fontSize: '0.84rem', color: 'var(--vv-red-soft)' }}>
                    Không đọc được bản trên cloud
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                onClick={() => void runAction(() => ctrl.chooseCloud())}
                disabled={busy}
                style={primaryBtnStyle('var(--vv-menu-green-grad)', busy)}
              >
                Dùng bản trên cloud
              </button>
              <button
                onClick={() => void runAction(() => ctrl.chooseLocal())}
                disabled={busy || !snap.canKeepLocal}
                style={primaryBtnStyle('var(--vv-menu-sky-grad)', busy || !snap.canKeepLocal)}
              >
                Dùng bản trên máy
              </button>
            </div>

            {!snap.canKeepLocal && (
              <div style={{ fontSize: '0.82rem', color: 'var(--vv-red-soft)', marginBottom: '8px' }}>
                Bản trên cloud mới hơn phiên bản game này — hãy tải lại trang để cập nhật.
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--vv-muted)' }}>
              Bản bị thay thế sẽ được giữ lại 7 ngày để hoàn tác.
            </div>
          </div>
        )
      }

      case 'offer_restore':
        return (
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--vv-sky-text)', marginBottom: '10px', fontWeight: 'bold' }}>
              Tài khoản này đã có tiến trình trên cloud.
            </div>
            {snap.cloudSummary && (
              <div style={{ background: 'var(--vv-subcard-bg)', border: '1px solid var(--vv-sky-border)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                <SummaryRows summary={snap.cloudSummary} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => void runAction(() => ctrl.chooseCloud())}
                disabled={busy}
                style={primaryBtnStyle('var(--vv-menu-green-grad)', busy)}
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
        return (
          <div style={{
            marginTop: '12px',
            background: 'var(--vv-sky-tint)',
            border: '1px solid var(--vv-sky-border)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--vv-sky-soft)' }}>
              Tìm thấy tiến trình cũ của tài khoản. Chọn một bản để dùng trên cloud.
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => void runAction(() => ctrl.importLegacy())}
                disabled={busy}
                style={primaryBtnStyle('var(--vv-menu-sky-grad)', busy)}
              >
                Nhập tiến trình cũ
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Tải tiến trình trên máy lên cloud? Sau đó sẽ không nhập được tiến trình cũ nữa.')) {
                    void runAction(() => ctrl.uploadLocal())
                  }
                }}
                disabled={busy}
                style={secondaryBtnStyle(busy)}
              >
                Dùng tiến trình trên máy này
              </button>
            </div>
          </div>
        )

      case 'account_mismatch':
        return (
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--vv-gold)', marginBottom: '12px', fontWeight: 'bold' }}>
              Tiến trình trên máy này thuộc một tài khoản khác.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {snap.cloudSummary !== null && (
                <button
                  onClick={() => void runAction(() => ctrl.chooseCloud())}
                  disabled={busy}
                  style={primaryBtnStyle('var(--vv-menu-green-grad)', busy)}
                >
                  Dùng bản trên cloud của tài khoản này
                </button>
              )}
              <button
                onClick={() => void runAction(() => ctrl.chooseLocal())}
                disabled={busy}
                style={primaryBtnStyle('var(--vv-menu-sky-grad)', busy)}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--vv-red-soft)' }}>
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
      backgroundColor: 'var(--vv-overlay)',
      zIndex: 100,
      pointerEvents: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--vv-panel-grad)',
        border: '2px solid var(--vv-sky)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: 'var(--vv-modal-sky-shadow)',
        color: 'var(--vv-text)',
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
            color: 'var(--vv-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={28} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: 'var(--vv-sky)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CloudCheck color="var(--vv-sky)" /> Supabase Cloud Save & Đăng nhập YunDev
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--vv-muted)' }}>
          Đồng bộ tài khoản dùng chung qua <code>www.yundev.space</code>.
        </p>

        {/* Trạng Thái Tài Khoản YunDev */}
        <div style={{
          background: currentUser ? 'var(--vv-green-tint)' : 'var(--vv-gold-tint)',
          border: currentUser ? '1px solid var(--vv-green)' : '1px solid var(--vv-gold-solid)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: currentUser ? 'var(--vv-green-soft)' : 'var(--vv-gold)' }}>
              {currentUser ? <UserCheck size={20} /> : <Lock size={20} />}
              <span>{currentUser ? `Đã đăng nhập YunDev: ${currentUser.displayName}` : 'Tài khoản: Khách'}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--vv-muted)', marginTop: '4px' }}>
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
                  background: 'var(--vv-sky-tint)',
                  border: '1px solid var(--vv-sky)',
                  color: 'var(--vv-sky-text)',
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
                  background: 'var(--vv-btn-gold-grad-short)',
                  border: 'none',
                  color: 'var(--vv-on-solid)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--vv-btn-gold-shadow)'
                }}
              >
                <LogIn size={16} /> Đăng nhập YunDev
              </button>
            )}
          </div>
        </div>

        {/* Trạng Thái Đồng Bộ Cloud */}
        <div style={{
          background: 'var(--vv-sky-tint)',
          border: '1px solid var(--vv-sky)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--vv-sky-text)', fontSize: '1.05rem', marginBottom: '12px' }}>
            <Database size={20} /> Tài Khoản Cloud: <span style={{ color: 'var(--vv-gold-soft)' }}>{cloudService.getPlayerName()}</span>
          </div>

          {snap.notice === 'import_exists' && (
            <div style={{ fontSize: '0.88rem', color: 'var(--vv-gold)', marginBottom: '10px', fontWeight: 'bold' }}>
              Đã có bản lưu cloud; không thể nhập bản cũ.
            </div>
          )}

          {renderSyncContent()}

          {snap.backupAvailable && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--vv-divider)' }}>
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
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: 'var(--vv-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="var(--vv-gold)" size={20} /> Bảng Xếp Hạng Cao Thủ Toàn Máy Chủ (Supabase Cloud)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((player, idx) => (
                <div key={player.rank} style={{
                  background: idx === 0 ? 'var(--vv-gold-tint)' : 'var(--vv-surface-2-alpha)',
                  border: idx === 0 ? '1.5px solid var(--vv-gold-solid)' : '1px solid var(--vv-border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--vv-gold-soft)' : 'var(--vv-text-2)' }}>{player.display_name || 'Cao Thủ Sử Việt'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--vv-muted)' }}>Màn chơi: Ải {Number(player.max_unlocked_stage || 0) + 1}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--vv-gold)' : 'var(--vv-sky)', fontSize: '1.05rem' }}>
                    ⚔️ {player.pvp_score || 1250} Điểm PvP
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                background: 'var(--vv-surface-2-alpha)',
                border: '1px solid var(--vv-border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                color: 'var(--vv-muted)',
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
