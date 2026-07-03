"""create questions table

Revision ID: 004
Revises: 003
Create Date: 2024-07-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chapter_id', sa.Integer(), nullable=False),
        sa.Column('question_number', sa.Integer(), nullable=False),
        sa.Column('question_text', sa.String(), nullable=False),
        sa.Column('option_a', sa.String(), nullable=False),
        sa.Column('option_b', sa.String(), nullable=False),
        sa.Column('option_c', sa.String(), nullable=False),
        sa.Column('option_d', sa.String(), nullable=False),
        sa.Column('correct_answer', sa.String(1), nullable=False),
        sa.Column('status', sa.Enum('NEW', 'MASTERED', 'REVIEW', 'ALMOST_FORGOT', 'ERROR', name='questionstatus'), nullable=False, server_default='NEW'),
        sa.Column('times_attempted', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('times_correct', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('times_wrong', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=func.now(), nullable=True),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)
    op.create_index(op.f('ix_questions_chapter_id'), 'questions', ['chapter_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_questions_chapter_id'), table_name='questions')
    op.drop_index(op.f('ix_questions_id'), table_name='questions')
    op.drop_table('questions')
    op.execute('DROP TYPE questionstatus')
