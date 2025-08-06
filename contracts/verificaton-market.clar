;; Verification Market Contract (Clarity v1)
;; Allows verifiers to register and sell identity verifications to users

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-VERIFIER-NOT-FOUND u101)
(define-constant ERR-ALREADY-VERIFIED u102)
(define-constant ERR-INSUFFICIENT-FUNDS u103)

(define-data-var admin principal tx-sender)

;; Verifier info
(define-map verifiers principal
  {
    price: uint,
    name: (string-ascii 64)
  }
)

;; Track which user was verified by which verifier
(define-map verifications (tuple (user principal) (verifier principal)) bool)

;; === Helper Functions ===

(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

(define-private (verifier-exists? (v principal))
  (is-some (map-get? verifiers v))
)

;; === Admin ===

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

;; === Verifier Management ===

(define-public (register-verifier (price uint) (name (string-ascii 64)))
  (begin
    (map-set verifiers tx-sender {
      price: price,
      name: name
    })
    (ok true)
  )
)

(define-public (update-verifier-price (new-price uint))
  (begin
    (asserts! (verifier-exists? tx-sender) (err ERR-VERIFIER-NOT-FOUND))
    (let ((existing (unwrap! (map-get? verifiers tx-sender) (err ERR-VERIFIER-NOT-FOUND))))
      (map-set verifiers tx-sender {
        price: new-price,
        name: (get name existing)
      })
      (ok true)
    )
  )
)

(define-read-only (get-verifier (v principal))
  (match (map-get? verifiers v)
    info (ok info)
    (err ERR-VERIFIER-NOT-FOUND)
  )
)

(define-read-only (get-verification (user principal) (verifier principal))
  (ok (default-to false (map-get? verifications {user: user, verifier: verifier})))
)

;; === Verification Purchase ===

(define-public (buy-verification (verifier principal))
  (begin
    (asserts! (not (is-eq tx-sender verifier)) (err ERR-NOT-AUTHORIZED))
    (let ((vinfo (unwrap! (map-get? verifiers verifier) (err ERR-VERIFIER-NOT-FOUND))))
      (let ((price (get price vinfo)))
        (asserts! (is-none (map-get? verifications {user: tx-sender, verifier: verifier})) (err ERR-ALREADY-VERIFIED))
        (asserts! (>= (stx-get-balance tx-sender) price) (err ERR-INSUFFICIENT-FUNDS))
        (try! (stx-transfer? price tx-sender verifier))
        (map-set verifications {user: tx-sender, verifier: verifier} true)
        (ok true)
      )
    )
  )
)
