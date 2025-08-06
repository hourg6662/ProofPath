;; ProofPath User Identity Contract
;; Clarity v1.0.0
;; This contract handles user registration, role assignment, and access verification

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-REGISTERED u101)
(define-constant ERR-NOT-REGISTERED u102)
(define-constant ERR-INVALID-ROLE u103)
(define-constant ERR-ADDRESS-ZERO u104)

(define-constant ROLE-LEARNER u1)
(define-constant ROLE-ISSUER u2)
(define-constant ROLE-VERIFIER u3)

;; Admin
(define-data-var contract-owner principal tx-sender)

;; Maps for users
(define-map user-roles principal uint)
(define-map user-metadata principal (string-ascii 100))

;; Private: is-owner
(define-private (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

;; Register a user with role and optional metadata
(define-public (register-user (role uint) (metadata (string-ascii 100)))
  (begin
    (asserts! (is-eq (default-to u0 (map-get? user-roles tx-sender)) u0) (err ERR-ALREADY-REGISTERED))
    (match role
      ROLE-LEARNER (ok true)
      ROLE-ISSUER (ok true)
      ROLE-VERIFIER (ok true)
      (err ERR-INVALID-ROLE)
    )
    (map-set user-roles tx-sender role)
    (map-set user-metadata tx-sender metadata)
    (ok true)
  )
)

;; Admin-only: force register another user
(define-public (admin-register (user principal) (role uint) (metadata (string-ascii 100)))
  (begin
    (asserts! (is-owner) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (default-to u0 (map-get? user-roles user)) u0) (err ERR-ALREADY-REGISTERED))
    (match role
      ROLE-LEARNER (ok true)
      ROLE-ISSUER (ok true)
      ROLE-VERIFIER (ok true)
      (err ERR-INVALID-ROLE)
    )
    (map-set user-roles user role)
    (map-set user-metadata user metadata)
    (ok true)
  )
)

;; Admin-only: remove a user
(define-public (remove-user (user principal))
  (begin
    (asserts! (is-owner) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (is-eq (default-to u0 (map-get? user-roles user)) u0)) (err ERR-NOT-REGISTERED))
    (map-delete user-roles user)
    (map-delete user-metadata user)
    (ok true)
  )
)

;; Get role of a user
(define-read-only (get-role (user principal))
  (ok (default-to u0 (map-get? user-roles user)))
)

;; Get metadata of a user
(define-read-only (get-metadata (user principal))
  (ok (default-to "" (map-get? user-metadata user)))
)

;; Check if user has a specific role
(define-read-only (has-role (user principal) (role uint))
  (ok (is-eq (default-to u0 (map-get? user-roles user)) role))
)

;; Get contract owner
(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

;; Transfer ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-owner) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (is-eq new-owner 'SP000000000000000000002Q6VF78)) (err ERR-ADDRESS-ZERO))
    (var-set contract-owner new-owner)
    (ok true)
  )
)
