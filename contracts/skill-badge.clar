;; Skill Badge Smart Contract (Clarity v1)
;; Tracks skill-based NFTs for users linked to a verified user identity contract

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-BADGE-NOT-FOUND u101)
(define-constant ERR-USER-NOT-FOUND u102)
(define-constant ERR-ALREADY_ISSUED u103)

;; Admin control
(define-data-var admin principal tx-sender)

;; Badge struct
(define-map badges uint
  {
    name: (string-ascii 64),
    description: (string-ascii 256)
  }
)

;; Track user-badge ownerships
(define-map user-badges principal (list 100 uint)) ;; each user can hold up to 100 badges

;; Last badge ID issued
(define-data-var last-id uint u0)

;; === Helpers ===

(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

(define-private (badge-exists? (badge-id uint))
  (is-some (map-get? badges badge-id))
)

;; === Admin Functions ===

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

;; === Badge Management ===

(define-public (create-badge (name (string-ascii 64)) (description (string-ascii 256)))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((new-id (+ (var-get last-id) u1)))
      (map-set badges new-id {
        name: name,
        description: description
      })
      (var-set last-id new-id)
      (ok new-id)
    )
  )
)

(define-read-only (get-badge (badge-id uint))
  (match (map-get? badges badge-id)
    badge (ok badge)
    (err ERR-BADGE-NOT-FOUND)
  )
)

;; === Badge Issuance ===

(define-public (issue-badge (user principal) (badge-id uint) (user-contract principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (badge-exists? badge-id) (err ERR-BADGE-NOT-FOUND))

    ;; Call external user registry contract to validate user
    (match (contract-call? user-contract is-registered user)
      user-ok
        (if (is-eq user-ok true)
          (let ((existing (default-to (list) (map-get? user-badges user))))
            ;; Check if already issued
            (asserts! (is-none (find-in-list existing badge-id)) (err ERR-ALREADY_ISSUED))
            (map-set user-badges user (append existing (list badge-id)))
            (ok true)
          )
          (err ERR-USER-NOT-FOUND)
        )
      err-code (err err-code)
    )
  )
)

(define-read-only (get-user-badges (user principal))
  (ok (default-to (list) (map-get? user-badges user)))
)

(define-read-only (get-admin)
  (ok (var-get admin))
)
