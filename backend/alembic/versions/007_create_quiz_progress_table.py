"""create quiz_progress table

Revision ID: 007
Revises: 006
Create Date: 2026-07-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'quiz_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('chapter_id', sa.Integer(), nullable=False),
        sa.Column('session_key', sa.String(), nullable=False),
        sa.Column('config', sa.JSON(), nullable=False),
        sa.Column('state', sa.JSON(), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_progress_id'), 'quiz_progress', ['id'], unique=False)
    op.create_index(op.f('ix_quiz_progress_user_id'), 'quiz_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_quiz_progress_chapter_id'), 'quiz_progress', ['chapter_id'], unique=False)
    op.create_index(op.f('ix_quiz_progress_session_key'), 'quiz_progress', ['session_key'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_quiz_progress_session_key'), table_name='quiz_progress')
    op.drop_index(op.f('ix_quiz_progress_chapter_id'), table_name='quiz_progress')
    op.drop_index(op.f('ix_quiz_progress_user_id'), table_name='quiz_progress')
    op.drop_index(op.f('ix_quiz_progress_id'), table_name='quiz_progress')
    op.drop_table('quiz_progress')
