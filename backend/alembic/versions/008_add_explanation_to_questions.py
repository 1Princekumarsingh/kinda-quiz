"""add explanation column to questions

Revision ID: 008
Revises: 007
Create Date: 2026-07-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('questions', sa.Column('explanation', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('questions', 'explanation')
