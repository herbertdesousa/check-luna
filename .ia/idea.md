ideia central:
poste check-ins para ganhar premios

check-in:
. Tipo: agua, comida, academia/musculação, cardio, super.
. Fotos
. Data
. Status: REVIEW | APPROVED | DENIED

regras de negócio
. Somente um tipo de check-in por dia
. Ao completar os check-ins agua, comida, academia, cardio, ganha um super.
. Pode postar até 20 fotos e no mínimo 1.
. Os check-ins nascem em review, ele deve ser aprovado para ser contabilizado.

não funcional:

table tb_checkin
. id
. type: string enum WATER, FOOD, GYM, CARDIO, SUPER
. status: string enum REVIEW, APPROVED, DENIED
. created_at

table tb_checkin_picture
. photo_url
. check_id: fk tb_checkin.id
. created_at

usar o shadcn para componentes e @tabler/icons-react para icones

---

não vamos criar ainda a tela de extrato e de premios
